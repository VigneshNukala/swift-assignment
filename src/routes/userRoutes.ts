import { IncomingMessage, ServerResponse } from "http";
import { Db } from "mongodb";
import { User } from "../utils/types";

export async function userRouter(req: IncomingMessage, res: ServerResponse, db: Db) {
  const collection = db.collection<User>("users");
  const url = req.url || "";
  const method = req.method || "";

  if (method === "GET" && url === "/users") {
    const users = await collection.find().toArray();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(users));
    return;
  }

  if (method === "GET" && url.match(/^\/users\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const user = await collection.findOne({ id });
    if (!user) {
      res.statusCode = 404;
      return res.end("User not found");
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(user));
    return;
  }

  if (method === "POST" && url === "/users") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const data: User = JSON.parse(body);
        await collection.insertOne(data);
        res.statusCode = 201;
        res.setHeader("Location", `/users/${data.id}`);
        res.end(JSON.stringify({ message: "User created" }));
      } catch {
        res.statusCode = 400;
        res.end("Invalid request");
      }
    });
    return;
  }

  if (method === "PUT" && url.match(/^\/users\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const updateData: User = JSON.parse(body);
      if (updateData.id && updateData.id !== id) {
        res.statusCode = 400;
        return res.end("ID in body does not match URL");
      }
      const result = await collection.updateOne({ id }, { $set: updateData });
      if (result.matchedCount === 0) {
        res.statusCode = 404;
        return res.end("User not found");
      }
      res.statusCode = 204;
      res.end();
    });
    return;
  }

  if (method === "DELETE" && url.match(/^\/users\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const result = await collection.deleteOne({ id });
    if (result.deletedCount === 0) {
      res.statusCode = 404;
      return res.end("User not found");
    }
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 404;
  res.end("Route not found");
}

