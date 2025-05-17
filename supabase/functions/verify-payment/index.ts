
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RequestBody {
  sessionId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')!
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get request body
    const { sessionId } = await req.json() as RequestBody
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing session ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    // Check if the payment was successful
    const isSuccess = session.payment_status === 'paid'
    
    // If successful and the user ID matches, we can apply credits
    if (isSuccess && session.metadata?.user_id === user.id) {
      // Check if credits were already applied by the webhook
      // This prevents duplicate credits if webhook has already processed
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()
      
      // If we want to add credits directly here as a backup (in case webhook failed)
      // we could do it here, but be careful to avoid duplicate credit additions
      
      return new Response(
        JSON.stringify({ 
          success: true,
          paid: true,
          credits: profile?.credits || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else if (session.payment_status === 'paid' && session.metadata?.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Session user ID does not match authenticated user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          paid: session.payment_status === 'paid',
          status: session.payment_status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to verify payment', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
