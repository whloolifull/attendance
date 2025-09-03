import axios from "axios";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Call Dify workflow
    const response = await axios.post("http://43.217.240.242/v1/workflows/3cce9ecc-271e-413b-8175-b66d18bb9a6a/run", req.body, {
      headers: {
        Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      // Follow redirects if Dify API redirects
      maxRedirects: 0,
      validateStatus: (status) => status < 400, // treat 3xx as error
    });

    console.log("Dify API raw response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
}
