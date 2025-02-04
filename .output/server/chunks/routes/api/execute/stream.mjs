import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { v as v4 } from '../../../_/v4.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'node:crypto';

function applyFlowVariables(obj, variables) {
  let result = JSON.parse(JSON.stringify(obj));
  let resultStr = JSON.stringify(result);
  resultStr = applyFlowVariablesOnString(resultStr, variables);
  console.log(resultStr);
  return JSON.parse(resultStr);
}
function applyFlowVariablesOnString(text, variabless) {
  let result = text;
  try {
    for (let key in variabless) {
      result = result.replace("{{" + key + "}}", variabless[key]);
    }
    return result.replace(/\n/g, "\\n");
  } catch {
    return result;
  }
}

function evaluateCondition(condition) {
  const result = evaluateConditionReturnByConditionValue(condition).value === "true";
  console.log("evaluateCondition : " + result);
  return result;
}
function evaluateConditionReturnByConditionValue(condition) {
  const toBoolean = (booleanStr) => {
    return booleanStr.toLowerCase() === "true";
  };
  let left = JSON.parse(JSON.stringify(condition.leftSide));
  let right = JSON.parse(JSON.stringify(condition.rightSide));
  if (left.valueType === "condition") {
    left = evaluateConditionReturnByConditionValue(left.value);
  }
  if (right.valueType === "condition") {
    right = evaluateConditionReturnByConditionValue(right.value);
  }
  console.log("left: " + left.value + "  right: " + right.value);
  let evaluateResult = false;
  switch (condition.comparisonOperator) {
    case "=":
      evaluateResult = left.value === right.value;
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    case "!=":
      evaluateResult = left.value !== right.value;
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    case "<":
      if (left.valueType !== "number" || right.valueType !== "number") {
        throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
      }
      evaluateResult = Number(left.value) < Number(right.value);
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    case ">":
      if (left.valueType !== "number" || right.valueType !== "number") {
        throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
      }
      evaluateResult = Number(left.value) > Number(right.value);
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    case "<=":
      if (left.valueType !== "number" || right.valueType !== "number") {
        throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
      }
      evaluateResult = Number(left.value) <= Number(right.value);
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    case ">=":
      if (left.valueType !== "number" || right.valueType !== "number") {
        throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
      }
      evaluateResult = Number(left.value) >= Number(right.value);
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    case "contain":
      if (typeof left.value === "string" && typeof right.value === "string") {
        evaluateResult = left.value.includes(right.value);
        return {
          value: evaluateResult.toString(),
          valueType: "boolean"
        };
      }
      throw new Error(`Invalid types for 'contain' operator: ${typeof left.value} and ${typeof right.value}`);
    case "&":
      evaluateResult = toBoolean(left.value) && toBoolean(right.value);
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    case "|":
      evaluateResult = toBoolean(left.value) || toBoolean(right.value);
      return {
        value: evaluateResult.toString(),
        valueType: "boolean"
      };
    default:
      throw new Error(`Unsupported operator: ${condition.comparisonOperator}`);
  }
}

function reverseTransformToRequestParameterArray(params, parentType = "object") {
  let result = {};
  if (parentType === "array") {
    if (!Array.isArray(result)) {
      result = [];
    }
  }
  for (const param of params) {
    if (!param.key) {
      if (param.children) {
        if (param.children.length > 0) {
          result.push(reverseTransformToRequestParameterArray(param.children, param.type));
        } else {
          result = null;
        }
      } else {
        if (parentType === "array") {
          result.push(param.value);
        } else {
          result = param.value;
        }
      }
    } else {
      if (param.children) {
        if (parentType === "array") {
          result.push({ [param.key]: reverseTransformToRequestParameterArray(param.children, param.type) });
        } else {
          if (param.children.length > 0) {
            result[param.key] = reverseTransformToRequestParameterArray(param.children, param.type);
          } else {
            result[param.key] = null;
          }
        }
      } else {
        if (parentType === "array") {
          result.push({ [param.key]: param.value });
        } else {
          result[param.key] = param.value;
        }
      }
    }
  }
  return result;
}

function executeScriptApiItem(apiItem, variables, executionResult) {
  try {
    const func = new Function("variables", "result", apiItem.script);
    if (apiItem.isScriptEnabled) {
      func(variables, executionResult);
    }
  } catch (error) {
    console.error("\u30B9\u30AF\u30EA\u30D7\u30C8\u5B9F\u884C\u30A8\u30E9\u30FC:", error);
  }
}
function executeScript(scriptItem, variables) {
  try {
    const func = new Function("variables", scriptItem.script);
    func(variables);
  } catch (error) {
    console.error("\u30B9\u30AF\u30EA\u30D7\u30C8\u5B9F\u884C\u30A8\u30E9\u30FC:", error);
  }
}

async function executeStep(apiItem) {
  console.log("apiItem", apiItem);
  try {
    const data = await $fetch("/api/execute-flow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        apiItem
      }
    });
    return {
      result: data,
      error: ""
    };
  } catch (e) {
    return {
      result: {},
      error: e.message
    };
  }
}
async function callApi(flowItem, variables, sendData, isClientDisconnected) {
  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  if (isClientDisconnected()) {
    await sendData({ id: flowItem.id, status: "Done" });
    return;
  }
  const startTime = Date.now();
  if (!flowItem.isItemActive) {
    return;
  }
  await sendData({ id: flowItem.id, status: "In progress" });
  try {
    if (!flowItem.isItemActive) {
      return;
    }
    if (flowItem.type === "condition" || flowItem.type === "loop") {
      if (!evaluateCondition(applyFlowVariables(flowItem.condition, variables))) {
        await sendData({ id: flowItem.id, status: "Done" });
        return;
      }
    }
    if (flowItem.type === "api") {
      let stepConverted = JSON.parse(JSON.stringify(flowItem));
      stepConverted.headers = applyFlowVariables(reverseTransformToRequestParameterArray(flowItem.headers), variables);
      stepConverted.endpoint = applyFlowVariablesOnString(flowItem.endpoint, variables);
      stepConverted.body = applyFlowVariables(reverseTransformToRequestParameterArray(flowItem.body), variables);
      console.log(stepConverted);
      const result = await executeStep(stepConverted);
      console.log(JSON.stringify(result));
      if (result && result.result) {
        const executionResult = {
          id: v4(),
          success: result.result.success,
          data: result.result.data ? result.result.data : {},
          error: result.result.error ? result.result.error : null,
          executionDate: startTime,
          duration: Date.now() - startTime
        };
        executeScriptApiItem(flowItem, variables, executionResult);
        await sendData({ id: flowItem.id, executionResult, variables });
      }
      console.log("result : ", result);
      console.log(result.result.success);
      if (!result.result.success) {
        throw new Error(`\u30B9\u30C6\u30C3\u30D7 ${flowItem.id} \u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F: ${result.error}`);
      }
    }
    if (flowItem.type === "script") {
      executeScript(flowItem, variables);
      await sendData({ id: flowItem.id, variables });
    }
    if (flowItem.flowItems && flowItem.flowItems.length > 0) {
      for (const item of flowItem.flowItems) {
        if (isClientDisconnected()) break;
        await callApi(JSON.parse(JSON.stringify(item)), variables, sendData, isClientDisconnected);
      }
    }
    if (flowItem.type === "loop") {
      console.log(
        "flowItem.loopType === 'while' && evaluateCondition(...): ",
        flowItem.loopType === "while" && evaluateCondition(applyFlowVariables(flowItem.condition, variables))
      );
      if (flowItem.loopType === "while" && evaluateCondition(applyFlowVariables(flowItem.condition, variables))) {
        await delay(200);
        await callApi(JSON.parse(JSON.stringify(flowItem)), variables, sendData, isClientDisconnected);
      }
    }
    if (flowItem.type === "end") {
      await sendData({ id: flowItem.id, status: "Done" });
      return;
    }
    if (flowItem.type === "wait") {
      await delay(flowItem.waitTime);
    }
    await sendData({ id: flowItem.id, status: "Done" });
  } catch (e) {
    console.log("error : " + e.message);
    await sendData({ id: flowItem.id, status: "Done" });
    throw e;
  }
}
const stream = defineEventHandler(async (event) => {
  const { req, res } = event.node;
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Transfer-Encoding", "chunked");
  let clientDisconnected = false;
  const { flowItem, variables } = await readBody(event);
  console.log("flowItem : " + JSON.stringify(flowItem));
  req.on("close", () => {
    clientDisconnected = true;
  });
  const isClientDisconnected = () => clientDisconnected;
  const sendData = async (data) => {
    if (isClientDisconnected()) return;
    const payload = JSON.stringify(data) + "\n";
    res.write(payload);
  };
  await sendData({ connectionStatus: "established" });
  try {
    await callApi(flowItem, variables, sendData, isClientDisconnected);
    if (!isClientDisconnected()) {
      await sendData({ connectionStatus: "completed" });
      res.end();
    }
  } catch (error) {
    if (!isClientDisconnected()) {
      await sendData({ error: error.message });
      res.end();
    }
  }
});

export { stream as default, executeStep };
//# sourceMappingURL=stream.mjs.map
