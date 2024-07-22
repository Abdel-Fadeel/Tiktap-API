// import { Storage } from "@google-cloud/storage";
// import { v4 as uuidv4 } from "uuid";

// const storage = new Storage();
// const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

// export const uploadImage = async (file) => {
//   const { originalname, buffer } = file;
//   const blob = bucket.file(`${uuidv4()}-${originalname}`);
//   const blobStream = blob.createWriteStream({
//     resumable: false,
//   });

//   return new Promise((resolve, reject) => {
//     blobStream
//       .on("finish", async () => {
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//         resolve(publicUrl);
//       })
//       .on("error", (err) => {
//         reject(err);
//       })
//       .end(buffer);
//   });
// };

// export const deleteImage = async (url) => {
//   const fileName = url.split("/").pop();
//   await bucket.file(fileName).delete();
// };
