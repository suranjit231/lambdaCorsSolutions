// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// const s3 = new S3Client({ region: 'us-east-1' });

// export const getUploadUrl = async (event) => {
//   try {
//     const { fileName, fileType } = JSON.parse(event.body);

//     const fileKey = `uploads/${Date.now()}-${fileName}`;
    
//     const url = await getSignedUrl(s3, new PutObjectCommand({
//       Bucket: process.env.BUCKET,
//       Key: fileKey, // Added timestamp for uniqueness
//       ContentType: fileType
//     }), { expiresIn: 3600 });


//     return{
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization, token",
//       },
//       body: JSON.stringify({ success: true, url: url, fileKey:fileKey }),
//     };




//   } catch (error) {
//     return {
//       statusCode: 400,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization, token",
//       },
//       body: JSON.stringify({ error: error.message })
//     };
//   }
// };























import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'us-east-1' });

export const getUploadUrls = async (event) => {
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, token',
       
      },
      body: JSON.stringify({ message: 'CORS preflight response' })
    };
  }

  try {
    const { video, frameImage, backgroundMusic, fileTypes } = JSON.parse(event.body);
    
    const generateKey = (fileName, prefix) => 
      `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${fileName}`;

    const urls = {};
    
    if (video) {
      const videoKey = generateKey(video, 'videos');
      urls.video = {
        url: await getSignedUrl(s3, new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: videoKey,
          ContentType: fileTypes.video
        }), { expiresIn: 3600 }),
        key: videoKey
      };
    }

    if (frameImage) {
      const frameImageKey = generateKey(frameImage, 'frame-images');
      urls.frameImage = {
        url: await getSignedUrl(s3, new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: frameImageKey,
          ContentType: fileTypes.frameImage
        }), { expiresIn: 3600 }),
        key: frameImageKey
      };
    }

    if (backgroundMusic) {
      const backgroundMusicKey = generateKey(backgroundMusic, 'background-music');
      urls.backgroundMusic = {
        url: await getSignedUrl(s3, new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: backgroundMusicKey,
          ContentType: fileTypes.backgroundMusic
        }), { expiresIn: 3600 }),
        key: backgroundMusicKey
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, token',
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: JSON.stringify({ 
        success: true, 
        urls 
      }),
    };

  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, token',
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
