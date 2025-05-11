
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

interface SearchResult {
  id: string;
  userId: string;
  data: Record<string, any>[];
  createdAt: string;
  name: string;
  type: string;
  recordCount: number;
}

interface SearchResultRequest {
  userId: string;
  result: Omit<SearchResult, 'id' | 'userId' | 'createdAt'>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, data, userId, result, resultId } = await req.json();

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
      case "storeSearchResult":
        return handleStoreSearchResult({ userId, result }, token);
      case "getSearchResults":
        return handleGetSearchResults(userId, token);
      case "getSearchResultById":
        return handleGetSearchResultById(userId, resultId, token);
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

async function handleStoreSearchResult(request: SearchResultRequest, token: string) {
  const { userId, result } = request;
  
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
    // Store the search result in a temporary memory store
    // In a real implementation, you would store this in a database
    const id = crypto.randomUUID();
    const searchResult: SearchResult = {
      id,
      userId,
      createdAt: new Date().toISOString(),
      ...result
    };
    
    // For demo purposes, store in localStorage - in production this would be in database
    // We'll use Supabase auth for user isolation but store locally for simplicity
    const userResults = await getUserResults(userId, token);
    userResults.push(searchResult);
    
    // Store the updated results
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ 
        updated_at: new Date().toISOString(),
        // This is a workaround - in a real implementation, you'd use a dedicated table
        // The following is just a temporary solution
        avatar_url: `search_results:${btoa(JSON.stringify(userResults))}` 
      })
    });
    
    if (!storeResponse.ok) {
      throw new Error("Failed to store search results");
    }
    
    return new Response(
      JSON.stringify({ id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error storing search result:", error);
    return new Response(
      JSON.stringify({ error: "Failed to store search result" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleGetSearchResults(userId: string, token: string) {
  try {
    const results = await getUserResults(userId, token);
    
    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error retrieving search results:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve search results" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleGetSearchResultById(userId: string, resultId: string, token: string) {
  try {
    const results = await getUserResults(userId, token);
    const result = results.find(r => r.id === resultId);
    
    if (!result) {
      return new Response(
        JSON.stringify({ error: "Search result not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error retrieving search result:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve search result" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function getUserResults(userId: string, token: string): Promise<SearchResult[]> {
  // Create Supabase client for edge function
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  // Create a fetch client with auth
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "apikey": supabaseAnonKey
  };

  // Get user profile
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=avatar_url`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error("Failed to retrieve user profile");
  }
  
  const userData = await response.json();
  
  if (!userData.length) {
    throw new Error("User profile not found");
  }
  
  const avatarUrl = userData[0].avatar_url || '';
  
  // Check if we have stored results
  if (avatarUrl.startsWith('search_results:')) {
    try {
      const resultsJson = atob(avatarUrl.substring(14));
      return JSON.parse(resultsJson);
    } catch (e) {
      console.error("Error parsing stored results:", e);
    }
  }
  
  return [];
}
