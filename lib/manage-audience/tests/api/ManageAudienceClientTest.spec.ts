import { ManageAudienceClient } from "../../api.js";

import { AddAudienceToAudienceGroupRequest } from "../../model/addAudienceToAudienceGroupRequest.js";
import { AudienceGroupCreateRoute } from "../../model/audienceGroupCreateRoute.js";
import { AudienceGroupStatus } from "../../model/audienceGroupStatus.js";
import { CreateAudienceGroupRequest } from "../../model/createAudienceGroupRequest.js";
import { CreateAudienceGroupResponse } from "../../model/createAudienceGroupResponse.js";
import { CreateClickBasedAudienceGroupRequest } from "../../model/createClickBasedAudienceGroupRequest.js";
import { CreateClickBasedAudienceGroupResponse } from "../../model/createClickBasedAudienceGroupResponse.js";
import { CreateImpBasedAudienceGroupRequest } from "../../model/createImpBasedAudienceGroupRequest.js";
import { CreateImpBasedAudienceGroupResponse } from "../../model/createImpBasedAudienceGroupResponse.js";
import { ErrorResponse } from "../../model/errorResponse.js";
import { GetAudienceDataResponse } from "../../model/getAudienceDataResponse.js";
import { GetAudienceGroupsResponse } from "../../model/getAudienceGroupsResponse.js";
import { GetSharedAudienceDataResponse } from "../../model/getSharedAudienceDataResponse.js";
import { GetSharedAudienceGroupsResponse } from "../../model/getSharedAudienceGroupsResponse.js";
import { UpdateAudienceGroupDescriptionRequest } from "../../model/updateAudienceGroupDescriptionRequest.js";

import { createServer } from "node:http";
import { deepEqual, equal, ok } from "node:assert";

import { describe, it } from "vitest";

const channel_access_token = "test_channel_access_token";

// This is not a perfect multipart/form-data parser,
// but it works for the purpose of this test.
function parseForm(arrayBuffer: ArrayBuffer): Record<string, string | Blob> {
  const uint8Array = new Uint8Array(arrayBuffer);
  const text = new TextDecoder().decode(uint8Array);

  const boundary = text.match(/^--[^\r\n]+/)![0];

  // split to parts, and drop first and last empty parts
  const parts = text.split(new RegExp(boundary + "(?:\\r\\n|--)")).slice(1, -1);

  const result: Record<string, string | Blob> = {};

  for (const part of parts) {
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;

    const headers = part.slice(0, headerEnd);
    const content = part.slice(headerEnd + 4);

    const nameMatch = headers.match(/name="([^"]+)"/);
    const fileNameMatch = headers.match(/filename="([^"]+)"/);

    if (nameMatch) {
      const name = nameMatch[1];

      if (fileNameMatch) {
        // it's a file
        const contentTypeMatch = headers.match(/Content-Type:\s*(\S+)/i);
        const contentType = contentTypeMatch
          ? contentTypeMatch[1]
          : "application/octet-stream";

        result[name] = new Blob([content.replace(/\r\n$/, "")], {
          type: contentType,
        });
      } else {
        // basic field
        const value = content.trim();
        result[name] = value;
      }
    }
  }

  return result;
}

describe("ManageAudienceClient", () => {
  it("addAudienceToAudienceGroupWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "PUT");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/upload");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.addAudienceToAudienceGroupWithHttpInfo(
      // addAudienceToAudienceGroupRequest: AddAudienceToAudienceGroupRequest
      {} as unknown as AddAudienceToAudienceGroupRequest, // paramName=addAudienceToAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("addAudienceToAudienceGroup", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "PUT");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/upload");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.addAudienceToAudienceGroup(
      // addAudienceToAudienceGroupRequest: AddAudienceToAudienceGroupRequest
      {} as unknown as AddAudienceToAudienceGroupRequest, // paramName=addAudienceToAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createAudienceGroupWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/upload");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createAudienceGroupWithHttpInfo(
      // createAudienceGroupRequest: CreateAudienceGroupRequest
      {} as unknown as CreateAudienceGroupRequest, // paramName=createAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createAudienceGroup", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/upload");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createAudienceGroup(
      // createAudienceGroupRequest: CreateAudienceGroupRequest
      {} as unknown as CreateAudienceGroupRequest, // paramName=createAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createClickBasedAudienceGroupWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/click");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createClickBasedAudienceGroupWithHttpInfo(
      // createClickBasedAudienceGroupRequest: CreateClickBasedAudienceGroupRequest
      {} as unknown as CreateClickBasedAudienceGroupRequest, // paramName=createClickBasedAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createClickBasedAudienceGroup", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/click");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createClickBasedAudienceGroup(
      // createClickBasedAudienceGroupRequest: CreateClickBasedAudienceGroupRequest
      {} as unknown as CreateClickBasedAudienceGroupRequest, // paramName=createClickBasedAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createImpBasedAudienceGroupWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/imp");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createImpBasedAudienceGroupWithHttpInfo(
      // createImpBasedAudienceGroupRequest: CreateImpBasedAudienceGroupRequest
      {} as unknown as CreateImpBasedAudienceGroupRequest, // paramName=createImpBasedAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createImpBasedAudienceGroup", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/audienceGroup/imp");

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createImpBasedAudienceGroup(
      // createImpBasedAudienceGroupRequest: CreateImpBasedAudienceGroupRequest
      {} as unknown as CreateImpBasedAudienceGroupRequest, // paramName=createImpBasedAudienceGroupRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("deleteAudienceGroupWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/{audienceGroupId}".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.deleteAudienceGroupWithHttpInfo(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("deleteAudienceGroup", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/{audienceGroupId}".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.deleteAudienceGroup(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getAudienceDataWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/{audienceGroupId}".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAudienceDataWithHttpInfo(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getAudienceData", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/{audienceGroupId}".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAudienceData(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getAudienceGroupsWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/list"
          .replace("{page}", "0") // number
          .replace("{description}", "DUMMY") // string
          .replace("{size}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("page"),
        String(
          // page: number
          "DUMMY" as unknown as number, // paramName=page(enum)
        ),
      );
      equal(
        queryParams.get("description"),
        String(
          // description: string
          "DUMMY" as unknown as string, // paramName=description(enum)
        ),
      );
      equal(
        queryParams.get("status"),
        String(
          // status: AudienceGroupStatus
          "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)
        ),
      );
      equal(
        queryParams.get("size"),
        String(
          // size: number
          "DUMMY" as unknown as number, // paramName=size(enum)
        ),
      );
      equal(
        queryParams.get("includesExternalPublicGroups"),
        String(
          // includesExternalPublicGroups: boolean
          "DUMMY" as unknown as boolean, // paramName=includesExternalPublicGroups(enum)
        ),
      );
      equal(
        queryParams.get("createRoute"),
        String(
          // createRoute: AudienceGroupCreateRoute
          "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)
        ),
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAudienceGroupsWithHttpInfo(
      // page: number
      "DUMMY" as unknown as number, // paramName=page(enum)

      // description: string
      "DUMMY" as unknown as string, // paramName=description(enum)

      // status: AudienceGroupStatus
      "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)

      // size: number
      "DUMMY" as unknown as number, // paramName=size(enum)

      // includesExternalPublicGroups: boolean
      "DUMMY" as unknown as boolean, // paramName=includesExternalPublicGroups(enum)

      // createRoute: AudienceGroupCreateRoute
      "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getAudienceGroups", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/list"
          .replace("{page}", "0") // number
          .replace("{description}", "DUMMY") // string
          .replace("{size}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("page"),
        String(
          // page: number
          "DUMMY" as unknown as number, // paramName=page(enum)
        ),
      );
      equal(
        queryParams.get("description"),
        String(
          // description: string
          "DUMMY" as unknown as string, // paramName=description(enum)
        ),
      );
      equal(
        queryParams.get("status"),
        String(
          // status: AudienceGroupStatus
          "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)
        ),
      );
      equal(
        queryParams.get("size"),
        String(
          // size: number
          "DUMMY" as unknown as number, // paramName=size(enum)
        ),
      );
      equal(
        queryParams.get("includesExternalPublicGroups"),
        String(
          // includesExternalPublicGroups: boolean
          "DUMMY" as unknown as boolean, // paramName=includesExternalPublicGroups(enum)
        ),
      );
      equal(
        queryParams.get("createRoute"),
        String(
          // createRoute: AudienceGroupCreateRoute
          "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)
        ),
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAudienceGroups(
      // page: number
      "DUMMY" as unknown as number, // paramName=page(enum)

      // description: string
      "DUMMY" as unknown as string, // paramName=description(enum)

      // status: AudienceGroupStatus
      "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)

      // size: number
      "DUMMY" as unknown as number, // paramName=size(enum)

      // includesExternalPublicGroups: boolean
      "DUMMY" as unknown as boolean, // paramName=includesExternalPublicGroups(enum)

      // createRoute: AudienceGroupCreateRoute
      "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getSharedAudienceDataWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/shared/{audienceGroupId}".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getSharedAudienceDataWithHttpInfo(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getSharedAudienceData", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/shared/{audienceGroupId}".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getSharedAudienceData(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getSharedAudienceGroupsWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/shared/list"
          .replace("{page}", "0") // number
          .replace("{description}", "DUMMY") // string
          .replace("{size}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("page"),
        String(
          // page: number
          "DUMMY" as unknown as number, // paramName=page(enum)
        ),
      );
      equal(
        queryParams.get("description"),
        String(
          // description: string
          "DUMMY" as unknown as string, // paramName=description(enum)
        ),
      );
      equal(
        queryParams.get("status"),
        String(
          // status: AudienceGroupStatus
          "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)
        ),
      );
      equal(
        queryParams.get("size"),
        String(
          // size: number
          "DUMMY" as unknown as number, // paramName=size(enum)
        ),
      );
      equal(
        queryParams.get("createRoute"),
        String(
          // createRoute: AudienceGroupCreateRoute
          "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)
        ),
      );
      equal(
        queryParams.get("includesOwnedAudienceGroups"),
        String(
          // includesOwnedAudienceGroups: boolean
          "DUMMY" as unknown as boolean, // paramName=includesOwnedAudienceGroups(enum)
        ),
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getSharedAudienceGroupsWithHttpInfo(
      // page: number
      "DUMMY" as unknown as number, // paramName=page(enum)

      // description: string
      "DUMMY" as unknown as string, // paramName=description(enum)

      // status: AudienceGroupStatus
      "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)

      // size: number
      "DUMMY" as unknown as number, // paramName=size(enum)

      // createRoute: AudienceGroupCreateRoute
      "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)

      // includesOwnedAudienceGroups: boolean
      "DUMMY" as unknown as boolean, // paramName=includesOwnedAudienceGroups(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getSharedAudienceGroups", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/shared/list"
          .replace("{page}", "0") // number
          .replace("{description}", "DUMMY") // string
          .replace("{size}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("page"),
        String(
          // page: number
          "DUMMY" as unknown as number, // paramName=page(enum)
        ),
      );
      equal(
        queryParams.get("description"),
        String(
          // description: string
          "DUMMY" as unknown as string, // paramName=description(enum)
        ),
      );
      equal(
        queryParams.get("status"),
        String(
          // status: AudienceGroupStatus
          "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)
        ),
      );
      equal(
        queryParams.get("size"),
        String(
          // size: number
          "DUMMY" as unknown as number, // paramName=size(enum)
        ),
      );
      equal(
        queryParams.get("createRoute"),
        String(
          // createRoute: AudienceGroupCreateRoute
          "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)
        ),
      );
      equal(
        queryParams.get("includesOwnedAudienceGroups"),
        String(
          // includesOwnedAudienceGroups: boolean
          "DUMMY" as unknown as boolean, // paramName=includesOwnedAudienceGroups(enum)
        ),
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getSharedAudienceGroups(
      // page: number
      "DUMMY" as unknown as number, // paramName=page(enum)

      // description: string
      "DUMMY" as unknown as string, // paramName=description(enum)

      // status: AudienceGroupStatus
      "DUMMY" as unknown as AudienceGroupStatus, // paramName=status(enum)

      // size: number
      "DUMMY" as unknown as number, // paramName=size(enum)

      // createRoute: AudienceGroupCreateRoute
      "DUMMY" as unknown as AudienceGroupCreateRoute, // paramName=createRoute(enum)

      // includesOwnedAudienceGroups: boolean
      "DUMMY" as unknown as boolean, // paramName=includesOwnedAudienceGroups(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("updateAudienceGroupDescriptionWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "PUT");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/{audienceGroupId}/updateDescription".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.updateAudienceGroupDescriptionWithHttpInfo(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)

      // updateAudienceGroupDescriptionRequest: UpdateAudienceGroupDescriptionRequest
      {} as unknown as UpdateAudienceGroupDescriptionRequest, // paramName=updateAudienceGroupDescriptionRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("updateAudienceGroupDescription", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "PUT");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/audienceGroup/{audienceGroupId}/updateDescription".replace(
          "{audienceGroupId}",
          "0",
        ), // number
      );

      equal(req.headers["authorization"], `Bearer ${channel_access_token}`);
      equal(req.headers["user-agent"], "@line/bot-sdk/1.0.0-test");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({}));
    });
    await new Promise(resolve => {
      server.listen(0);
      server.on("listening", resolve);
    });

    const serverAddress = server.address();
    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error("Unexpected server address: " + serverAddress);
    }

    const client = new ManageAudienceClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.updateAudienceGroupDescription(
      // audienceGroupId: number
      0, // paramName=audienceGroupId(number or int or long)

      // updateAudienceGroupDescriptionRequest: UpdateAudienceGroupDescriptionRequest
      {} as unknown as UpdateAudienceGroupDescriptionRequest, // paramName=updateAudienceGroupDescriptionRequest
    );

    equal(requestCount, 1);
    server.close();
  });
});
