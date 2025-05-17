
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.8.0"
import { corsHeaders } from "../_shared/cors.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

interface RequestBody {
  packageId: number
  quantity: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the auth token from the request header
    const authHeader = req.headers.get('Authorization')!
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get request body
    const { packageId, quantity } = await req.json() as RequestBody

    // Get package details from the database
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (packageError || !packageData) {
      return new Response(
        JSON.stringify({ error: 'Package not found or not active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get user profile to check if they meet restrictions (if any)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_stride_crm_user, stride_location_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check user type restrictions
    if (packageData.user_type_restriction === 'stride_crm_user' && !userProfile.is_stride_crm_user) {
      return new Response(
        JSON.stringify({ error: 'This package is only available to Stride CRM users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    if (packageData.user_type_restriction === 'non_stride_crm_user' && userProfile.is_stride_crm_user) {
      return new Response(
        JSON.stringify({ error: 'This package is only available to non-Stride CRM users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Check minimum purchase quantity
    if (quantity < packageData.min_credits_to_purchase) {
      return new Response(
        JSON.stringify({ 
          error: `Minimum purchase quantity is ${packageData.min_credits_to_purchase}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calculate the total in cents
    const totalAmount = packageData.price_per_credit_usd_cents * quantity;
    const pricePerCredit = (packageData.price_per_credit_usd_cents / 100).toFixed(2);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${quantity} Credits`,
              description: `${packageData.name} - $${pricePerCredit}/credit`,
            },
            unit_amount: packageData.price_per_credit_usd_cents,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/purchase?payment_cancelled=true`,
      metadata: {
        user_id: user.id,
        package_id: packageId,
        quantity: quantity.toString(),
      },
    })

    // Return the session ID to the client
    return new Response(
      JSON.stringify({ success: true, checkoutUrl: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
