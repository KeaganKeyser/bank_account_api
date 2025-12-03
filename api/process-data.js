// async function readRawBody(req) {
//    return new Promise((resolve, reject) => {
//     let data = '';
//     req.on('data', (chunk) => {
//       if (typeof chunk !== 'string' && !(chunk instanceof Buffer) && !(chunk instanceof Uint8Array)) {
//         return reject(new Error('Invalid chunk type received'));
//       }
//       data += chunk;
//     });
//     req.on('end', () => {
//       resolve(data);
//     });
//     req.on('error', (err) => reject(err));
//   });
// }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    let rawBody;
    // if (req.body && typeof req.body === 'object') {
    //   rawBody = JSON.stringify(req.body); // Convert the parsed body back to a string
    // } 
    // else {
    //    rawBody = await readRawBody(req); // Read the raw body
    // }
    // const rawBody = await readRawBody(req);
     let outputdata;
    // const data = await req.json();
    // const match = rawBody.body.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    // let object = JSON.parse(rawBody);
    // const match = req.body.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
     const match = req.body;

      res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
     // res.end(object.body);
    res.end(match);
    
    
     // if (match && match[1]) {
     //   outputdata = JSON.parse(match[1]);
     // } else  try {
     //    outputdata = JSON.parse(rawBody || '{}');
     //  } catch (jsonErr) {
     //    // Attempt to parse URL-encoded payloads like: body=%7B...%7D
     //    const params = new URLSearchParams(rawBody || '');
     //    if (params.has('body')) {
     //      const bodyStr = params.get('body') || '{}';
     //      outputdata = JSON.parse(bodyStr);
     //    } else {
     //      // Re-throw original JSON error to be handled by outer catch
     //      throw jsonErr;
     //    }
     //  }
    //  if (outputdata && typeof outputdata === 'object' && typeof outputdata.body === 'string') {
    //   const inner = outputdata.body.trim();
    //   try {
    //     // Replace outputdata with the parsed inner object if valid JSON
    //     const parsedInner = JSON.parse(inner);
    //     outputdata = parsedInner;
    //   } catch (innerErr) {
    //     // If inner isn't valid JSON, leave outputdata as-is (or optionally keep both)
    //     // For visibility keep original object but attach a parsedBody if possible
    //     // (Here we choose to leave as-is; you can change to merge if desired)
    //   }
    // }
//     return req;
//      const data = await req.json();

//     const match = data.body?.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// const jsonText = match ? match[1] : req;
// const outputdata = JSON.parse(jsonText);
    
    
    // Return the same data as response
    // return NextResponse.json(outputdata);

    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'application/json');
    //  // res.end(object.body);
    // res.end(match);
  } catch (err) {
    res.statusCode = 400; // Bad Request for parsing errors
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid JSON or data format', details: err?.message || String(err) }));
  }
}
