// // async function readRawBody(req) {
// //    return new Promise((resolve, reject) => {
// //     let data = '';
// //     req.on('data', (chunk) => {
// //       if (typeof chunk !== 'string' && !(chunk instanceof Buffer) && !(chunk instanceof Uint8Array)) {
// //         return reject(new Error('Invalid chunk type received'));
// //       }
// //       data += chunk;
// //     });
// //     req.on('end', () => {
// //       resolve(data);
// //     });
// //     req.on('error', (err) => reject(err));
// //   });
// // }
// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     res.statusCode = 405;
//     res.setHeader('Content-Type', 'application/json');
//     return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
//   }

//   try {
//     let rawBody;
//     // if (req.body && typeof req.body === 'object') {
//     //   rawBody = JSON.stringify(req.body); // Convert the parsed body back to a string
//     // } 
//     // else {
//     //    rawBody = await readRawBody(req); // Read the raw body
//     // }
//     // const rawBody = await readRawBody(req);
//      let outputdata;
//     // const data = await req.json();
//     // const match = rawBody.body.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

//     // let object = JSON.parse(rawBody);
//     // const match = req.body.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
//      const match = req.body;

//       res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//      // res.end(object.body);
//     res.end(match);
    
    
//      // if (match && match[1]) {
//      //   outputdata = JSON.parse(match[1]);
//      // } else  try {
//      //    outputdata = JSON.parse(rawBody || '{}');
//      //  } catch (jsonErr) {
//      //    // Attempt to parse URL-encoded payloads like: body=%7B...%7D
//      //    const params = new URLSearchParams(rawBody || '');
//      //    if (params.has('body')) {
//      //      const bodyStr = params.get('body') || '{}';
//      //      outputdata = JSON.parse(bodyStr);
//      //    } else {
//      //      // Re-throw original JSON error to be handled by outer catch
//      //      throw jsonErr;
//      //    }
//      //  }
//     //  if (outputdata && typeof outputdata === 'object' && typeof outputdata.body === 'string') {
//     //   const inner = outputdata.body.trim();
//     //   try {
//     //     // Replace outputdata with the parsed inner object if valid JSON
//     //     const parsedInner = JSON.parse(inner);
//     //     outputdata = parsedInner;
//     //   } catch (innerErr) {
//     //     // If inner isn't valid JSON, leave outputdata as-is (or optionally keep both)
//     //     // For visibility keep original object but attach a parsedBody if possible
//     //     // (Here we choose to leave as-is; you can change to merge if desired)
//     //   }
//     // }
// //     return req;
// //      const data = await req.json();

// //     const match = data.body?.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // const jsonText = match ? match[1] : req;
// // const outputdata = JSON.parse(jsonText);
    
    
//     // Return the same data as response
//     // return NextResponse.json(outputdata);

//     // res.statusCode = 200;
//     // res.setHeader('Content-Type', 'application/json');
//     //  // res.end(object.body);
//     // res.end(match);
//   } catch (err) {
//     res.statusCode = 400; // Bad Request for parsing errors
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ error: 'Invalid JSON or data format', details: err?.message || String(err) }));
//   }
// }

// export default function handler(req, res) {
//   try {
//     // Step 1: req.body is first-level parsed JSON
//     const first = req.body;

//     if (!first || typeof first.body !== "string") {
//       return res.status(400).json({ error: "Invalid structure: missing 'body' string" });
//     }

//     // Step 2: Parse the inner JSON string
//     let parsedInner;

//     try {
//       parsedInner = JSON.parse(first.body);
//     } catch (err) {
//       return res.status(400).json({
//         error: "Inner JSON parsing failed",
//         details: err.message,
//         raw_body: first.body
//       });
//     }

//     // Success
//     return res.status(200).json({
//       success: true,
//       parsed: parsedInner
//     });

//   } catch (err) {
//     return res.status(500).json({
//       error: "Unexpected server error",
//       details: err.message
//     });
//   }
// }

// api/parse-inner-json.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // assume top-level parsed or raw body may be present
    const top = req.body && typeof req.body === 'object' ? req.body : (req.body || { body: '' });

    // Ensure we have a string to parse
    const innerRaw = typeof top.body === 'string' ? top.body : (top.body ? JSON.stringify(top.body) : '');

    // sanitizer: remove common zero-width / BOM / joiner characters
    function removeZeroWidth(s) {
      // U+200B..U+200D ZERO WIDTH (and U+FEFF BOM)
      return s.replace(/[\u200B-\u200D\uFEFF]/g, '');
    }

    function tryParse(jsonStr) {
      return JSON.parse(jsonStr);
    }

    // 1) Clean invisible characters and trim
    let cleaned = removeZeroWidth(innerRaw).trim();

    if (!cleaned) {
      return res.status(400).json({
        error: 'Inner JSON parsing failed',
        details: 'Inner body is empty or only whitespace after cleaning',
        raw_body: innerRaw,
      });
    }

    // 2) Try straightforward parse
    try {
      const parsed = tryParse(cleaned);
      return res.status(200).json({ success: true, parsed });
    } catch (err) {
      // If error indicates trailing data after JSON, attempt a safe truncate
      const msg = String(err.message || err);
      const trailingError = /Unexpected non-whitespace character after JSON|Unexpected token .* in JSON at position|Unexpected end of JSON input/i;

      if (trailingError.test(msg)) {
        // Attempt to truncate after the last '}' — note: this is heuristic.
        const lastBrace = cleaned.lastIndexOf('}');
        if (lastBrace !== -1) {
          const truncated = cleaned.slice(0, lastBrace + 1).trim();
          // remove zero width again (defensive)
          const truncatedCleaned = removeZeroWidth(truncated);

          try {
            const parsed = tryParse(truncatedCleaned);
              console.log("@Response : ", parsed);
              console.error('@@TESTLOG ERROR-LIKE - start');
            return res.status(200).json({
              success: true,
              parsed,
              note: 'Parsed after truncating trailing garbage after the final }',
              original_raw_body: innerRaw,
              cleaned_raw_body: cleaned,
              truncated_raw_body: truncatedCleaned,
            });
          } catch (err2) {
            // fall through to final error return
            return res.status(400).json({
              error: 'Inner JSON parsing failed',
              details: 'Parsing failed even after truncation: ' + String(err2.message || err2),
              original_raw_body: innerRaw,
              cleaned_raw_body: cleaned,
              truncated_raw_body: truncatedCleaned,
            });
          }
        }
      }

      // Generic failure
      return res.status(400).json({
        error: 'Inner JSON parsing failed',
        details: msg,
        raw_body: innerRaw,
      });
    }
  } catch (outerErr) {
    return res.status(500).json({
      error: 'Server error',
      details: String(outerErr.message || outerErr),
    });
  }
}


