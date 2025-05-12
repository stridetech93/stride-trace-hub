
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

interface RequestBody {
  package_id: number
  number_of_credits_to_purchase: number
  userId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { package_id, number_of_credits_to_purchase, userId } = await req.json() as RequestBody
    
    // Get auth user if not explicitly provided (used for admin operations)
    let user_id = userId
    
    if (!user_id) {
      const authHeader = req.headers.get('Authorization')!
      const token = authHeader.replace('Bearer ', '')
      
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized', message: userError?.message || 'User not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }
      
      user_id = user.id
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()
    
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found', message: profileError?.message || 'User profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get credit package
    const { data: creditPackage, error: packageError } = await supabaseAdmin
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single()
    
    if (packageError || !creditPackage) {
      return new Response(
        JSON.stringify({ error: 'Package not found', message: packageError?.message || 'Credit package not found or inactive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Validate purchase amount meets minimum
    if (number_of_credits_to_purchase < creditPackage.min_credits_to_purchase) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid purchase amount', 
          message: `Minimum purchase for this package is ${creditPackage.min_credits_to_purchase} credits` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate user type restriction if applicable
    if (creditPackage.user_type_restriction === 'stride_crm_user' && !profile.is_stride_crm_user) {
      return new Response(
        JSON.stringify({ 
          error: 'User type restriction', 
          message: 'This package is only available to Stride CRM users' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Validate stride_location_id if user is a stride_crm_user
    if (creditPackage.user_type_restriction === 'stride_crm_user' && 
        profile.is_stride_crm_user && 
        !profile.stride_location_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing Stride Location ID', 
          message: 'Stride CRM users must provide a valid Location ID' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calculate total cost (for reference, not used in transaction yet)
    const totalCostCents = number_of_credits_to_purchase * creditPackage.price_per_credit_usd_cents
    
    // In a real implementation, we would integrate with a payment gateway here
    // For now, we'll simulate a successful purchase by adding credits directly
    
    // Update user's credit balance
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: profile.credits + number_of_credits_to_purchase,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Update failed', message: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Return success response with details
    return new Response(
      JSON.stringify({
        success: true,
        credits_added: number_of_credits_to_purchase,
        new_balance: profile.credits + number_of_credits_to_purchase,
        total_cost_cents: totalCostCents,
        total_cost_dollars: (totalCostCents / 100).toFixed(2)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error processing credit purchase:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error', message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
