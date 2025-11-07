async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    // const rawBody = await readRawBody(req);
    // let outputdata;

    // const match = rawBody.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    
    // if (match && match[1]) {
    //   outputdata = JSON.parse(match[1]);
    // } else {
    //   // If no markdown block, try to parse the raw body directly as JSON
    //   outputdata = JSON.parse(rawBody || '{}'); // Handle empty body gracefully
    // }
     const data = await req.json();

    const match = data.body?.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
const jsonText = match ? match[1] : req;
const outputdata = JSON.parse(jsonText);
    
    
    // Return the same data as response
    // return NextResponse.json(outputdata);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(outputdata));
  } catch (err) {
    res.statusCode = 400; // Bad Request for parsing errors
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid JSON or data format', details: err?.message || String(err) }));
  }
}
