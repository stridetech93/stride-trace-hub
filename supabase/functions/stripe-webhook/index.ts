
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.8.0"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get the request body as text for verification
    const body = await req.text()
    
    // Verify the event with Stripe
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    
    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Verify that payment was successful
        if (session.payment_status === 'paid') {
          // Extract metadata
          const userId = session.metadata?.user_id
          const packageId = parseInt(session.metadata?.package_id || '0')
          const quantity = parseInt(session.metadata?.quantity || '0')
          
          if (!userId || !packageId || !quantity) {
            console.error('Missing metadata in session:', session.metadata)
            return new Response(JSON.stringify({ error: 'Missing metadata' }), { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          
          // Update the user's credit balance
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single()
            
          if (fetchError) {
            console.error('Error fetching user profile:', fetchError)
            return new Response(JSON.stringify({ error: 'User not found' }), { 
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          
          const currentCredits = profile.credits || 0
          const newCredits = currentCredits + quantity
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', userId)
            
          if (updateError) {
            console.error('Error updating user credits:', updateError)
            return new Response(JSON.stringify({ error: 'Failed to update credits' }), { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          
          // Log the transaction (optional)
          // Here you could insert a record into a 'credit_transactions' table for auditing
        }
        break
      }
    }
    
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
