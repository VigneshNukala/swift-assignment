import { IncomingMessage, ServerResponse } from "http";
import { Db } from "mongodb";
import { Comment } from "../utils/types";

export async function commentRouter(req: IncomingMessage, res: ServerResponse, db: Db) {
  const collection = db.collection<Comment>("comments");
  const url = req.url || "";
  const method = req.method || "";

  if (method === "GET" && url === "/comments") {
    const comments = await collection.find().toArray();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(comments));
    return;
  }

  if (method === "GET" && url.match(/^\/comments\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const comment = await collection.findOne({ id });
    if (!comment) {
      res.statusCode = 404;
      return res.end("Comment not found");
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(comment));
    return;
  }

  if (method === "POST" && url === "/comments") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const data: Comment = JSON.parse(body);
        await collection.insertOne(data);
        res.statusCode = 201;
        res.setHeader("Location", `/comments/${data.id}`);
        res.end(JSON.stringify({ message: "Comment created" }));
      } catch {
        res.statusCode = 400;
        res.end("Invalid request");
      }
    });
    return;
  }

  if (method === "PUT" && url.match(/^\/comments\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const updateData: Comment = JSON.parse(body);
      if (updateData.id && updateData.id !== id) {
        res.statusCode = 400;
        return res.end("ID mismatch");
      }
      const result = await collection.updateOne({ id }, { $set: updateData });
      if (result.matchedCount === 0) {
        res.statusCode = 404;
        return res.end("Comment not found");
      }
      res.statusCode = 204;
      res.end();
    });
    return;
  }

  if (method === "DELETE" && url.match(/^\/comments\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const result = await collection.deleteOne({ id });
    if (result.deletedCount === 0) {
      res.statusCode = 404;
      return res.end("Comment not found");
    }
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 404;
  res.end("Route

