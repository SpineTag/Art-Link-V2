const { createClient } = require("@supabase/supabase-js");
const { IncomingForm } = require("formidable");
const fs = require("fs");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: false });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve({ fields, files });
    });
  });

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { fields, files } = await parseForm(req);
    const {
      artistName,
      artistEmail,
      artistBio,
      artworkTitle,
      artworkDescription,
      artworkCategory,
      artworkPrice,
      consent,
    } = fields;

    if (
      !artistName ||
      !artistEmail ||
      !artworkTitle ||
      !artworkDescription ||
      !artworkCategory ||
      consent !== "on" ||
      !files.artworkImage
    ) {
      res.status(400).json({
        success: false,
        message: "Please fill all required fields, upload an image, and accept consent.",
      });
      return;
    }

    const file = files.artworkImage;
    const fileBuffer = fs.readFileSync(file.filepath);
    const filename = `${Date.now()}-${file.originalFilename}`;

    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(filename, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      res.status(500).json({ success: false, message: "Failed to upload artwork image." });
      return;
    }

    const { data: publicData, error: publicError } = supabase.storage
      .from("artworks")
      .getPublicUrl(filename);

    if (publicError) {
      console.error("Supabase public URL error:", publicError);
      res.status(500).json({ success: false, message: "Unable to get artwork URL." });
      return;
    }

    const imageUrl = publicData.publicUrl;

    const { error: insertError } = await supabase.from("artworks").insert([
      {
        artist_name: artistName,
        artist_email: artistEmail,
        artist_bio: artistBio || "",
        artwork_title: artworkTitle,
        artwork_description: artworkDescription,
        artwork_category: artworkCategory,
        artwork_price: artworkPrice ? parseFloat(artworkPrice) : null,
        image_url: imageUrl,
        approved: false,
      },
    ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      res.status(500).json({ success: false, message: "Unable to save artwork details." });
      return;
    }

    res.status(200).json({ success: true, message: "Artwork submitted successfully. It will be reviewed before being displayed." });
  } catch (error) {
    console.error("Artwork submission error:", error);
    res.status(500).json({ success: false, message: "Unable to submit artwork right now, please try again later." });
  }
};