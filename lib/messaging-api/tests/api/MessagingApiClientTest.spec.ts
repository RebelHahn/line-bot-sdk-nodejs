import { MessagingApiClient } from "../../api.js";

import { BotInfoResponse } from "../../model/botInfoResponse.js";
import { BroadcastRequest } from "../../model/broadcastRequest.js";
import { CreateRichMenuAliasRequest } from "../../model/createRichMenuAliasRequest.js";
import { ErrorResponse } from "../../model/errorResponse.js";
import { GetAggregationUnitNameListResponse } from "../../model/getAggregationUnitNameListResponse.js";
import { GetAggregationUnitUsageResponse } from "../../model/getAggregationUnitUsageResponse.js";
import { GetFollowersResponse } from "../../model/getFollowersResponse.js";
import { GetJoinedMembershipUsersResponse } from "../../model/getJoinedMembershipUsersResponse.js";
import { GetMembershipSubscriptionResponse } from "../../model/getMembershipSubscriptionResponse.js";
import { GetWebhookEndpointResponse } from "../../model/getWebhookEndpointResponse.js";
import { GroupMemberCountResponse } from "../../model/groupMemberCountResponse.js";
import { GroupSummaryResponse } from "../../model/groupSummaryResponse.js";
import { GroupUserProfileResponse } from "../../model/groupUserProfileResponse.js";
import { IssueLinkTokenResponse } from "../../model/issueLinkTokenResponse.js";
import { MarkMessagesAsReadRequest } from "../../model/markMessagesAsReadRequest.js";
import { MembersIdsResponse } from "../../model/membersIdsResponse.js";
import { MembershipListResponse } from "../../model/membershipListResponse.js";
import { MessageQuotaResponse } from "../../model/messageQuotaResponse.js";
import { MulticastRequest } from "../../model/multicastRequest.js";
import { NarrowcastProgressResponse } from "../../model/narrowcastProgressResponse.js";
import { NarrowcastRequest } from "../../model/narrowcastRequest.js";
import { NumberOfMessagesResponse } from "../../model/numberOfMessagesResponse.js";
import { PnpMessagesRequest } from "../../model/pnpMessagesRequest.js";
import { PushMessageRequest } from "../../model/pushMessageRequest.js";
import { PushMessageResponse } from "../../model/pushMessageResponse.js";
import { QuotaConsumptionResponse } from "../../model/quotaConsumptionResponse.js";
import { ReplyMessageRequest } from "../../model/replyMessageRequest.js";
import { ReplyMessageResponse } from "../../model/replyMessageResponse.js";
import { RichMenuAliasListResponse } from "../../model/richMenuAliasListResponse.js";
import { RichMenuAliasResponse } from "../../model/richMenuAliasResponse.js";
import { RichMenuBatchProgressResponse } from "../../model/richMenuBatchProgressResponse.js";
import { RichMenuBatchRequest } from "../../model/richMenuBatchRequest.js";
import { RichMenuBulkLinkRequest } from "../../model/richMenuBulkLinkRequest.js";
import { RichMenuBulkUnlinkRequest } from "../../model/richMenuBulkUnlinkRequest.js";
import { RichMenuIdResponse } from "../../model/richMenuIdResponse.js";
import { RichMenuListResponse } from "../../model/richMenuListResponse.js";
import { RichMenuRequest } from "../../model/richMenuRequest.js";
import { RichMenuResponse } from "../../model/richMenuResponse.js";
import { RoomMemberCountResponse } from "../../model/roomMemberCountResponse.js";
import { RoomUserProfileResponse } from "../../model/roomUserProfileResponse.js";
import { SetWebhookEndpointRequest } from "../../model/setWebhookEndpointRequest.js";
import { ShowLoadingAnimationRequest } from "../../model/showLoadingAnimationRequest.js";
import { TestWebhookEndpointRequest } from "../../model/testWebhookEndpointRequest.js";
import { TestWebhookEndpointResponse } from "../../model/testWebhookEndpointResponse.js";
import { UpdateRichMenuAliasRequest } from "../../model/updateRichMenuAliasRequest.js";
import { UserProfileResponse } from "../../model/userProfileResponse.js";
import { ValidateMessageRequest } from "../../model/validateMessageRequest.js";

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

describe("MessagingApiClient", () => {
  it("broadcastWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/broadcast".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.broadcastWithHttpInfo(
      // broadcastRequest: BroadcastRequest
      {} as unknown as BroadcastRequest, // paramName=broadcastRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("broadcast", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/broadcast".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.broadcast(
      // broadcastRequest: BroadcastRequest
      {} as unknown as BroadcastRequest, // paramName=broadcastRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("cancelDefaultRichMenuWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/user/all/richmenu");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.cancelDefaultRichMenuWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("cancelDefaultRichMenu", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/user/all/richmenu");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.cancelDefaultRichMenu();

    equal(requestCount, 1);
    server.close();
  });

  it("createRichMenuWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createRichMenuWithHttpInfo(
      // richMenuRequest: RichMenuRequest
      {} as unknown as RichMenuRequest, // paramName=richMenuRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createRichMenu", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createRichMenu(
      // richMenuRequest: RichMenuRequest
      {} as unknown as RichMenuRequest, // paramName=richMenuRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createRichMenuAliasWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/alias");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createRichMenuAliasWithHttpInfo(
      // createRichMenuAliasRequest: CreateRichMenuAliasRequest
      {} as unknown as CreateRichMenuAliasRequest, // paramName=createRichMenuAliasRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("createRichMenuAlias", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/alias");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.createRichMenuAlias(
      // createRichMenuAliasRequest: CreateRichMenuAliasRequest
      {} as unknown as CreateRichMenuAliasRequest, // paramName=createRichMenuAliasRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("deleteRichMenuWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/{richMenuId}".replace("{richMenuId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.deleteRichMenuWithHttpInfo(
      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("deleteRichMenu", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/{richMenuId}".replace("{richMenuId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.deleteRichMenu(
      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("deleteRichMenuAliasWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/alias/{richMenuAliasId}".replace(
          "{richMenuAliasId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.deleteRichMenuAliasWithHttpInfo(
      // richMenuAliasId: string
      "DUMMY", // richMenuAliasId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("deleteRichMenuAlias", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/alias/{richMenuAliasId}".replace(
          "{richMenuAliasId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.deleteRichMenuAlias(
      // richMenuAliasId: string
      "DUMMY", // richMenuAliasId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getAggregationUnitNameListWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/aggregation/list"
          .replace("{limit}", "DUMMY") // string
          .replace("{start}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("limit"),
        String(
          // limit: string
          "DUMMY" as unknown as string, // paramName=limit(enum)
        ),
      );
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAggregationUnitNameListWithHttpInfo(
      // limit: string
      "DUMMY" as unknown as string, // paramName=limit(enum)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getAggregationUnitNameList", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/aggregation/list"
          .replace("{limit}", "DUMMY") // string
          .replace("{start}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("limit"),
        String(
          // limit: string
          "DUMMY" as unknown as string, // paramName=limit(enum)
        ),
      );
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAggregationUnitNameList(
      // limit: string
      "DUMMY" as unknown as string, // paramName=limit(enum)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getAggregationUnitUsageWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/aggregation/info");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAggregationUnitUsageWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getAggregationUnitUsage", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/aggregation/info");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getAggregationUnitUsage();

    equal(requestCount, 1);
    server.close();
  });

  it("getBotInfoWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/info");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getBotInfoWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getBotInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/info");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getBotInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getDefaultRichMenuIdWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/user/all/richmenu");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getDefaultRichMenuIdWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getDefaultRichMenuId", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/user/all/richmenu");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getDefaultRichMenuId();

    equal(requestCount, 1);
    server.close();
  });

  it("getFollowersWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/followers/ids"
          .replace("{start}", "DUMMY") // string
          .replace("{limit}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
        ),
      );
      equal(
        queryParams.get("limit"),
        String(
          // limit: number
          "DUMMY" as unknown as number, // paramName=limit(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getFollowersWithHttpInfo(
      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)

      // limit: number
      "DUMMY" as unknown as number, // paramName=limit(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getFollowers", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/followers/ids"
          .replace("{start}", "DUMMY") // string
          .replace("{limit}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
        ),
      );
      equal(
        queryParams.get("limit"),
        String(
          // limit: number
          "DUMMY" as unknown as number, // paramName=limit(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getFollowers(
      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)

      // limit: number
      "DUMMY" as unknown as number, // paramName=limit(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupMemberCountWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/members/count".replace("{groupId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupMemberCountWithHttpInfo(
      // groupId: string
      "DUMMY", // groupId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupMemberCount", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/members/count".replace("{groupId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupMemberCount(
      // groupId: string
      "DUMMY", // groupId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupMemberProfileWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/member/{userId}"
          .replace("{groupId}", "DUMMY") // string
          .replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupMemberProfileWithHttpInfo(
      // groupId: string
      "DUMMY", // groupId(string)

      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupMemberProfile", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/member/{userId}"
          .replace("{groupId}", "DUMMY") // string
          .replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupMemberProfile(
      // groupId: string
      "DUMMY", // groupId(string)

      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupMembersIdsWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/members/ids"
          .replace("{groupId}", "DUMMY") // string
          .replace("{start}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupMembersIdsWithHttpInfo(
      // groupId: string
      "DUMMY", // groupId(string)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupMembersIds", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/members/ids"
          .replace("{groupId}", "DUMMY") // string
          .replace("{start}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupMembersIds(
      // groupId: string
      "DUMMY", // groupId(string)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupSummaryWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/summary".replace("{groupId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupSummaryWithHttpInfo(
      // groupId: string
      "DUMMY", // groupId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getGroupSummary", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/summary".replace("{groupId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getGroupSummary(
      // groupId: string
      "DUMMY", // groupId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getJoinedMembershipUsersWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/membership/{membershipId}/users/ids"
          .replace("{membershipId}", "0") // number
          .replace("{start}", "DUMMY") // string
          .replace("{limit}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
        ),
      );
      equal(
        queryParams.get("limit"),
        String(
          // limit: number
          "DUMMY" as unknown as number, // paramName=limit(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getJoinedMembershipUsersWithHttpInfo(
      // membershipId: number
      0, // paramName=membershipId(number or int or long)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)

      // limit: number
      "DUMMY" as unknown as number, // paramName=limit(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getJoinedMembershipUsers", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/membership/{membershipId}/users/ids"
          .replace("{membershipId}", "0") // number
          .replace("{start}", "DUMMY") // string
          .replace("{limit}", "0"), // number
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
        ),
      );
      equal(
        queryParams.get("limit"),
        String(
          // limit: number
          "DUMMY" as unknown as number, // paramName=limit(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getJoinedMembershipUsers(
      // membershipId: number
      0, // paramName=membershipId(number or int or long)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)

      // limit: number
      "DUMMY" as unknown as number, // paramName=limit(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getMembershipListWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/membership/list");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMembershipListWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getMembershipList", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/membership/list");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMembershipList();

    equal(requestCount, 1);
    server.close();
  });

  it("getMembershipSubscriptionWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/membership/subscription/{userId}".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMembershipSubscriptionWithHttpInfo(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getMembershipSubscription", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/membership/subscription/{userId}".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMembershipSubscription(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getMessageQuotaWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/quota");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMessageQuotaWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getMessageQuota", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/quota");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMessageQuota();

    equal(requestCount, 1);
    server.close();
  });

  it("getMessageQuotaConsumptionWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/quota/consumption");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMessageQuotaConsumptionWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getMessageQuotaConsumption", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/quota/consumption");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getMessageQuotaConsumption();

    equal(requestCount, 1);
    server.close();
  });

  it("getNarrowcastProgressWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/progress/narrowcast".replace("{requestId}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("requestId"),
        String(
          // requestId: string
          "DUMMY" as unknown as string, // paramName=requestId(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNarrowcastProgressWithHttpInfo(
      // requestId: string
      "DUMMY" as unknown as string, // paramName=requestId(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNarrowcastProgress", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/progress/narrowcast".replace("{requestId}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("requestId"),
        String(
          // requestId: string
          "DUMMY" as unknown as string, // paramName=requestId(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNarrowcastProgress(
      // requestId: string
      "DUMMY" as unknown as string, // paramName=requestId(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentBroadcastMessagesWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/broadcast".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentBroadcastMessagesWithHttpInfo(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentBroadcastMessages", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/broadcast".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentBroadcastMessages(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentMulticastMessagesWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/multicast".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentMulticastMessagesWithHttpInfo(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentMulticastMessages", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/multicast".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentMulticastMessages(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentPushMessagesWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/push".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentPushMessagesWithHttpInfo(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentPushMessages", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/push".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentPushMessages(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentReplyMessagesWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/reply".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentReplyMessagesWithHttpInfo(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getNumberOfSentReplyMessages", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/reply".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getNumberOfSentReplyMessages(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getPNPMessageStatisticsWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/pnp".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getPNPMessageStatisticsWithHttpInfo(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getPNPMessageStatistics", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/delivery/pnp".replace("{date}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("date"),
        String(
          // date: string
          "DUMMY" as unknown as string, // paramName=date(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getPNPMessageStatistics(
      // date: string
      "DUMMY" as unknown as string, // paramName=date(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getProfileWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/profile/{userId}".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getProfileWithHttpInfo(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getProfile", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/profile/{userId}".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getProfile(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/{richMenuId}".replace("{richMenuId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuWithHttpInfo(
      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenu", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/{richMenuId}".replace("{richMenuId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenu(
      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuAliasWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/alias/{richMenuAliasId}".replace(
          "{richMenuAliasId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuAliasWithHttpInfo(
      // richMenuAliasId: string
      "DUMMY", // richMenuAliasId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuAlias", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/alias/{richMenuAliasId}".replace(
          "{richMenuAliasId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuAlias(
      // richMenuAliasId: string
      "DUMMY", // richMenuAliasId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuAliasListWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/alias/list");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuAliasListWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuAliasList", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/alias/list");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuAliasList();

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuBatchProgressWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/progress/batch".replace("{requestId}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("requestId"),
        String(
          // requestId: string
          "DUMMY" as unknown as string, // paramName=requestId(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuBatchProgressWithHttpInfo(
      // requestId: string
      "DUMMY" as unknown as string, // paramName=requestId(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuBatchProgress", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/progress/batch".replace("{requestId}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("requestId"),
        String(
          // requestId: string
          "DUMMY" as unknown as string, // paramName=requestId(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuBatchProgress(
      // requestId: string
      "DUMMY" as unknown as string, // paramName=requestId(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuIdOfUserWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/richmenu".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuIdOfUserWithHttpInfo(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuIdOfUser", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/richmenu".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuIdOfUser(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuListWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/list");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuListWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getRichMenuList", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/list");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRichMenuList();

    equal(requestCount, 1);
    server.close();
  });

  it("getRoomMemberCountWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/members/count".replace("{roomId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRoomMemberCountWithHttpInfo(
      // roomId: string
      "DUMMY", // roomId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRoomMemberCount", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/members/count".replace("{roomId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRoomMemberCount(
      // roomId: string
      "DUMMY", // roomId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRoomMemberProfileWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/member/{userId}"
          .replace("{roomId}", "DUMMY") // string
          .replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRoomMemberProfileWithHttpInfo(
      // roomId: string
      "DUMMY", // roomId(string)

      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRoomMemberProfile", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/member/{userId}"
          .replace("{roomId}", "DUMMY") // string
          .replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRoomMemberProfile(
      // roomId: string
      "DUMMY", // roomId(string)

      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRoomMembersIdsWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/members/ids"
          .replace("{roomId}", "DUMMY") // string
          .replace("{start}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRoomMembersIdsWithHttpInfo(
      // roomId: string
      "DUMMY", // roomId(string)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getRoomMembersIds", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/members/ids"
          .replace("{roomId}", "DUMMY") // string
          .replace("{start}", "DUMMY"), // string
      );

      // Query parameters
      const queryParams = new URLSearchParams(reqUrl.search);
      equal(
        queryParams.get("start"),
        String(
          // start: string
          "DUMMY" as unknown as string, // paramName=start(enum)
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getRoomMembersIds(
      // roomId: string
      "DUMMY", // roomId(string)

      // start: string
      "DUMMY" as unknown as string, // paramName=start(enum)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("getWebhookEndpointWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/channel/webhook/endpoint");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getWebhookEndpointWithHttpInfo();

    equal(requestCount, 1);
    server.close();
  });

  it("getWebhookEndpoint", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "GET");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/channel/webhook/endpoint");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.getWebhookEndpoint();

    equal(requestCount, 1);
    server.close();
  });

  it("issueLinkTokenWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/linkToken".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.issueLinkTokenWithHttpInfo(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("issueLinkToken", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/linkToken".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.issueLinkToken(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("leaveGroupWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/leave".replace("{groupId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.leaveGroupWithHttpInfo(
      // groupId: string
      "DUMMY", // groupId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("leaveGroup", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/group/{groupId}/leave".replace("{groupId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.leaveGroup(
      // groupId: string
      "DUMMY", // groupId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("leaveRoomWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/leave".replace("{roomId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.leaveRoomWithHttpInfo(
      // roomId: string
      "DUMMY", // roomId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("leaveRoom", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/room/{roomId}/leave".replace("{roomId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.leaveRoom(
      // roomId: string
      "DUMMY", // roomId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("linkRichMenuIdToUserWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/richmenu/{richMenuId}"
          .replace("{userId}", "DUMMY") // string
          .replace("{richMenuId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.linkRichMenuIdToUserWithHttpInfo(
      // userId: string
      "DUMMY", // userId(string)

      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("linkRichMenuIdToUser", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/richmenu/{richMenuId}"
          .replace("{userId}", "DUMMY") // string
          .replace("{richMenuId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.linkRichMenuIdToUser(
      // userId: string
      "DUMMY", // userId(string)

      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("linkRichMenuIdToUsersWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/bulk/link");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.linkRichMenuIdToUsersWithHttpInfo(
      // richMenuBulkLinkRequest: RichMenuBulkLinkRequest
      {} as unknown as RichMenuBulkLinkRequest, // paramName=richMenuBulkLinkRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("linkRichMenuIdToUsers", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/bulk/link");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.linkRichMenuIdToUsers(
      // richMenuBulkLinkRequest: RichMenuBulkLinkRequest
      {} as unknown as RichMenuBulkLinkRequest, // paramName=richMenuBulkLinkRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("markMessagesAsReadWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/markAsRead");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.markMessagesAsReadWithHttpInfo(
      // markMessagesAsReadRequest: MarkMessagesAsReadRequest
      {} as unknown as MarkMessagesAsReadRequest, // paramName=markMessagesAsReadRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("markMessagesAsRead", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/markAsRead");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.markMessagesAsRead(
      // markMessagesAsReadRequest: MarkMessagesAsReadRequest
      {} as unknown as MarkMessagesAsReadRequest, // paramName=markMessagesAsReadRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("multicastWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/multicast".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.multicastWithHttpInfo(
      // multicastRequest: MulticastRequest
      {} as unknown as MulticastRequest, // paramName=multicastRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("multicast", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/multicast".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.multicast(
      // multicastRequest: MulticastRequest
      {} as unknown as MulticastRequest, // paramName=multicastRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("narrowcastWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/narrowcast".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.narrowcastWithHttpInfo(
      // narrowcastRequest: NarrowcastRequest
      {} as unknown as NarrowcastRequest, // paramName=narrowcastRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("narrowcast", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/narrowcast".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.narrowcast(
      // narrowcastRequest: NarrowcastRequest
      {} as unknown as NarrowcastRequest, // paramName=narrowcastRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("pushMessageWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/push".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.pushMessageWithHttpInfo(
      // pushMessageRequest: PushMessageRequest
      {} as unknown as PushMessageRequest, // paramName=pushMessageRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("pushMessage", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/message/push".replace("{xLineRetryKey}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.pushMessage(
      // pushMessageRequest: PushMessageRequest
      {} as unknown as PushMessageRequest, // paramName=pushMessageRequest

      // xLineRetryKey: string
      "DUMMY", // xLineRetryKey(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("pushMessagesByPhoneWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/bot/pnp/push".replace("{xLineDeliveryTag}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.pushMessagesByPhoneWithHttpInfo(
      // pnpMessagesRequest: PnpMessagesRequest
      {} as unknown as PnpMessagesRequest, // paramName=pnpMessagesRequest

      // xLineDeliveryTag: string
      "DUMMY", // xLineDeliveryTag(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("pushMessagesByPhone", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/bot/pnp/push".replace("{xLineDeliveryTag}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.pushMessagesByPhone(
      // pnpMessagesRequest: PnpMessagesRequest
      {} as unknown as PnpMessagesRequest, // paramName=pnpMessagesRequest

      // xLineDeliveryTag: string
      "DUMMY", // xLineDeliveryTag(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("replyMessageWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/reply");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.replyMessageWithHttpInfo(
      // replyMessageRequest: ReplyMessageRequest
      {} as unknown as ReplyMessageRequest, // paramName=replyMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("replyMessage", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/reply");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.replyMessage(
      // replyMessageRequest: ReplyMessageRequest
      {} as unknown as ReplyMessageRequest, // paramName=replyMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("richMenuBatchWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/batch");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.richMenuBatchWithHttpInfo(
      // richMenuBatchRequest: RichMenuBatchRequest
      {} as unknown as RichMenuBatchRequest, // paramName=richMenuBatchRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("richMenuBatch", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/batch");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.richMenuBatch(
      // richMenuBatchRequest: RichMenuBatchRequest
      {} as unknown as RichMenuBatchRequest, // paramName=richMenuBatchRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("setDefaultRichMenuWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/all/richmenu/{richMenuId}".replace(
          "{richMenuId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.setDefaultRichMenuWithHttpInfo(
      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("setDefaultRichMenu", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/all/richmenu/{richMenuId}".replace(
          "{richMenuId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.setDefaultRichMenu(
      // richMenuId: string
      "DUMMY", // richMenuId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("setWebhookEndpointWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "PUT");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/channel/webhook/endpoint");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.setWebhookEndpointWithHttpInfo(
      // setWebhookEndpointRequest: SetWebhookEndpointRequest
      {} as unknown as SetWebhookEndpointRequest, // paramName=setWebhookEndpointRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("setWebhookEndpoint", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "PUT");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/channel/webhook/endpoint");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.setWebhookEndpoint(
      // setWebhookEndpointRequest: SetWebhookEndpointRequest
      {} as unknown as SetWebhookEndpointRequest, // paramName=setWebhookEndpointRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("showLoadingAnimationWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/chat/loading/start");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.showLoadingAnimationWithHttpInfo(
      // showLoadingAnimationRequest: ShowLoadingAnimationRequest
      {} as unknown as ShowLoadingAnimationRequest, // paramName=showLoadingAnimationRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("showLoadingAnimation", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/chat/loading/start");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.showLoadingAnimation(
      // showLoadingAnimationRequest: ShowLoadingAnimationRequest
      {} as unknown as ShowLoadingAnimationRequest, // paramName=showLoadingAnimationRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("testWebhookEndpointWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/channel/webhook/test");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.testWebhookEndpointWithHttpInfo(
      // testWebhookEndpointRequest: TestWebhookEndpointRequest
      {} as unknown as TestWebhookEndpointRequest, // paramName=testWebhookEndpointRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("testWebhookEndpoint", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/channel/webhook/test");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.testWebhookEndpoint(
      // testWebhookEndpointRequest: TestWebhookEndpointRequest
      {} as unknown as TestWebhookEndpointRequest, // paramName=testWebhookEndpointRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("unlinkRichMenuIdFromUserWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/richmenu".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.unlinkRichMenuIdFromUserWithHttpInfo(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("unlinkRichMenuIdFromUser", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "DELETE");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/user/{userId}/richmenu".replace("{userId}", "DUMMY"), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.unlinkRichMenuIdFromUser(
      // userId: string
      "DUMMY", // userId(string)
    );

    equal(requestCount, 1);
    server.close();
  });

  it("unlinkRichMenuIdFromUsersWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/bulk/unlink");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.unlinkRichMenuIdFromUsersWithHttpInfo(
      // richMenuBulkUnlinkRequest: RichMenuBulkUnlinkRequest
      {} as unknown as RichMenuBulkUnlinkRequest, // paramName=richMenuBulkUnlinkRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("unlinkRichMenuIdFromUsers", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/bulk/unlink");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.unlinkRichMenuIdFromUsers(
      // richMenuBulkUnlinkRequest: RichMenuBulkUnlinkRequest
      {} as unknown as RichMenuBulkUnlinkRequest, // paramName=richMenuBulkUnlinkRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("updateRichMenuAliasWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/alias/{richMenuAliasId}".replace(
          "{richMenuAliasId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.updateRichMenuAliasWithHttpInfo(
      // richMenuAliasId: string
      "DUMMY", // richMenuAliasId(string)

      // updateRichMenuAliasRequest: UpdateRichMenuAliasRequest
      {} as unknown as UpdateRichMenuAliasRequest, // paramName=updateRichMenuAliasRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("updateRichMenuAlias", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(
        reqUrl.pathname,
        "/v2/bot/richmenu/alias/{richMenuAliasId}".replace(
          "{richMenuAliasId}",
          "DUMMY",
        ), // string
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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.updateRichMenuAlias(
      // richMenuAliasId: string
      "DUMMY", // richMenuAliasId(string)

      // updateRichMenuAliasRequest: UpdateRichMenuAliasRequest
      {} as unknown as UpdateRichMenuAliasRequest, // paramName=updateRichMenuAliasRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateBroadcastWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/broadcast");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateBroadcastWithHttpInfo(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateBroadcast", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/broadcast");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateBroadcast(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateMulticastWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/multicast");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateMulticastWithHttpInfo(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateMulticast", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/multicast");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateMulticast(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateNarrowcastWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/narrowcast");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateNarrowcastWithHttpInfo(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateNarrowcast", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/narrowcast");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateNarrowcast(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validatePushWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/push");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validatePushWithHttpInfo(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validatePush", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/push");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validatePush(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateReplyWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/reply");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateReplyWithHttpInfo(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateReply", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/message/validate/reply");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateReply(
      // validateMessageRequest: ValidateMessageRequest
      {} as unknown as ValidateMessageRequest, // paramName=validateMessageRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateRichMenuBatchRequestWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/validate/batch");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateRichMenuBatchRequestWithHttpInfo(
      // richMenuBatchRequest: RichMenuBatchRequest
      {} as unknown as RichMenuBatchRequest, // paramName=richMenuBatchRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateRichMenuBatchRequest", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/validate/batch");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateRichMenuBatchRequest(
      // richMenuBatchRequest: RichMenuBatchRequest
      {} as unknown as RichMenuBatchRequest, // paramName=richMenuBatchRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateRichMenuObjectWithHttpInfo", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/validate");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateRichMenuObjectWithHttpInfo(
      // richMenuRequest: RichMenuRequest
      {} as unknown as RichMenuRequest, // paramName=richMenuRequest
    );

    equal(requestCount, 1);
    server.close();
  });

  it("validateRichMenuObject", async () => {
    let requestCount = 0;

    const server = createServer((req, res) => {
      requestCount++;

      equal(req.method, "POST");
      const reqUrl = new URL(req.url, "http://localhost/");
      equal(reqUrl.pathname, "/v2/bot/richmenu/validate");

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

    const client = new MessagingApiClient({
      channelAccessToken: channel_access_token,
      baseURL: `http://localhost:${String(serverAddress.port)}/`,
    });

    const res = await client.validateRichMenuObject(
      // richMenuRequest: RichMenuRequest
      {} as unknown as RichMenuRequest, // paramName=richMenuRequest
    );

    equal(requestCount, 1);
    server.close();
  });
});
