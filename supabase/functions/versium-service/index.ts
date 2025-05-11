
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const VERSIUM_API_KEY = Deno.env.get("VERSIUM_API_KEY") || "";
const VERSIUM_BASE_URL = "https://api.versium.com/v2";

interface ContactAppendRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface DemographicAppendRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

interface CreditRequest {
  userId: string;
  operation: "check" | "deduct";
  amount?: number;
}

interface BatchProcessRequest {
  userId: string;
  data: Record<string, any>[];
  mappings: {
    source: string;
    target: string;
    isMapped: boolean;
  }[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, data, userId } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the JWT token
    const token = authHeader.split(" ")[1];
    
    // Process based on the action requested
    switch (action) {
      case "contactAppend":
        return handleContactAppend(data, userId, token);
      case "demographicAppend":
        return handleDemographicAppend(data, userId, token);
      case "checkCredits":
        return handleCreditOperation({ userId, operation: "check" }, token);
      case "processBatch":
        return handleBatchProcess(data as BatchProcessRequest, token);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleContactAppend(data: ContactAppendRequest, userId: string, token: string) {
  // First check if user has enough credits
  const creditsResponse = await handleCreditOperation({ userId, operation: "check" }, token);
  const creditsData = await creditsResponse.json();
  
  if (creditsResponse.status !== 200 || creditsData.credits < 1) {
    return new Response(
      JSON.stringify({ error: "Insufficient credits" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Make call to Versium API
    const response = await fetch(`${VERSIUM_BASE_URL}/contactappend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": VERSIUM_API_KEY,
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      // Deduct credits on successful API call
      await handleCreditOperation({ userId, operation: "deduct", amount: 1 }, token);
      
      return new Response(
        JSON.stringify(responseData),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Versium API error", details: responseData }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error calling Versium Contact Append API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to call Versium API" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleDemographicAppend(data: DemographicAppendRequest, userId: string, token: string) {
  // First check if user has enough credits
  const creditsResponse = await handleCreditOperation({ userId, operation: "check" }, token);
  const creditsData = await creditsResponse.json();
  
  if (creditsResponse.status !== 200 || creditsData.credits < 1) {
    return new Response(
      JSON.stringify({ error: "Insufficient credits" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Make call to Versium API
    const response = await fetch(`${VERSIUM_BASE_URL}/demographicappend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": VERSIUM_API_KEY,
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      // Deduct credits on successful API call
      await handleCreditOperation({ userId, operation: "deduct", amount: 1 }, token);
      
      return new Response(
        JSON.stringify(responseData),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Versium API error", details: responseData }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error calling Versium Demographic Append API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to call Versium API" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleBatchProcess(data: BatchProcessRequest, token: string) {
  // This is a placeholder for batch processing logic
  // In a real implementation, you would:
  // 1. Check if the user has enough credits for the batch
  // 2. Process each record in the batch
  // 3. Return the results
  
  return new Response(
    JSON.stringify({ message: "Batch processing not yet implemented" }),
    { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleCreditOperation(request: CreditRequest, token: string) {
  const { userId, operation, amount = 0 } = request;
  
  // Create Supabase client for edge function
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  // Create a fetch client with auth
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "apikey": supabaseAnonKey
  };

  try {
    if (operation === "check") {
      // Get user's current credits
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=credits`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error("Failed to retrieve user credits");
      }
      
      const userData = await response.json();
      
      if (!userData.length) {
        return new Response(
          JSON.stringify({ error: "User profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ credits: userData[0].credits }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (operation === "deduct") {
      // First get current credits
      const getResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=credits`, {
        headers
      });
      
      if (!getResponse.ok) {
        throw new Error("Failed to retrieve user credits");
      }
      
      const userData = await getResponse.json();
      
      if (!userData.length) {
        return new Response(
          JSON.stringify({ error: "User profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const currentCredits = userData[0].credits;
      const newCredits = Math.max(0, currentCredits - amount);
      
      // Update credits
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ credits: newCredits })
      });
      
      if (!updateResponse.ok) {
        throw new Error("Failed to update user credits");
      }
      
      return new Response(
        JSON.stringify({ success: true, credits: newCredits }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid credit operation" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling credit operation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process credit operation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
