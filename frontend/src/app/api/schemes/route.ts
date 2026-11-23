import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import seedSchemes from "@/data/schemes_seed.json";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let schemes: any[] = [];

    // Attempt direct high-speed Supabase query
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from("schemes_clean")
          .select("*")
          .limit(300);

        if (!error && data && data.length > 0) {
          schemes = data;
        }
      } catch (err: any) {
        console.warn("[API/SCHEMES] Supabase fetch fallback to bundled seed:", err.message);
      }
    }

    // High-reliability fallback to bundled verified seed if Supabase is offline or empty
    if (!schemes || schemes.length === 0) {
      schemes = seedSchemes as any[];
    }

    return NextResponse.json({
      success: true,
      count: schemes.length,
      schemes: schemes,
      source: schemes === seedSchemes ? "verified_seed_cache" : "supabase_clean_registry",
      last_updated: new Date().toISOString()
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch (error: any) {
    // Ultimate safety net: always return seed schemes rather than 0
    return NextResponse.json({
      success: true,
      count: seedSchemes.length,
      schemes: seedSchemes,
      source: "emergency_fallback_seed",
      error: error.message
    });
  }
}
