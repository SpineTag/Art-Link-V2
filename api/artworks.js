const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .eq("approved", true)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      res.status(500).json({ error: "Unable to load artworks." });
      return;
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error("Artwork fetch error:", error);
    res.status(500).json({ error: "Unable to load artworks." });
  }
};