import { IncomingMessage, ServerResponse } from "http";
import { Db } from "mongodb";
import { Post } from "../utils/types";

export async function postRouter(req: IncomingMessage, res: ServerResponse, db: Db) {
  const collection = db.collection<Post>("posts");
  const url = req.url || "";
  const method = req.method || "";

  if (method === "GET" && url === "/posts") {
    const posts = await collection.find().toArray();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(posts));
    return;
  }

  if (method === "GET" && url.match(/^\/posts\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const post = await collection.findOne({ id });
    if (!post) {
      res.statusCode = 404;
      return res.end("Post not found");
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(post));
    return;
  }

  if (method === "POST" && url === "/posts") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const data: Post = JSON.parse(body);
        await collection.insertOne(data);
        res.statusCode = 201;
        res.setHeader("Location", `/posts/${data.id}`);
        res.end(JSON.stringify({ message: "Post created" }));
      } catch {
        res.statusCode = 400;
        res.end("Invalid request");
      }
    });
    return;
  }

  if (method === "PUT" && url.match(/^\/posts\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const updateData: Post = JSON.parse(body);
      if (updateData.id && updateData.id !== id) {
        res.statusCode = 400;
        return res.end("ID mismatch");
      }
      const result = await collection.updateOne({ id }, { $set: updateData });
      if (result.matchedCount === 0) {
        res.statusCode = 404;
        return res.end("Post not found");
      }
      res.statusCode = 204;
      res.end();
    });
    return;
  }

  if (method === "DELETE" && url.match(/^\/posts\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const result = await collection.deleteOne({ id });
    if (result.deletedCount === 0) {
      res.statusCode = 404;
      return res.end("Post not found");
    }
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 404;
  res.end("Route not found");
}

