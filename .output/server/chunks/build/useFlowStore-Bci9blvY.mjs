import { defineStore } from 'pinia';
import { u as useFetch } from './fetch-vM0MWLpl.mjs';
import { v as v4 } from '../_/v4.mjs';

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
const useFlowStore = defineStore("flowStore", {
  state: () => ({
    savedFlowItems: [],
    uuuidOfLoadedSavedFlow: "",
    historyIndex: -1,
    masterFlow: {
      id: v4(),
      name: "",
      type: "flow",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: []
    },
    histories: [],
    isHistoryLoaded: false
  }),
  actions: {
    addFlowItem(parentItems, newflowItem = {
      id: "",
      name: "",
      type: "flow",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: []
    }) {
      let newFlowItemIdUpdated = JSON.parse(JSON.stringify(newflowItem));
      this.changeFlowId(newFlowItemIdUpdated);
      parentItems.push(newFlowItemIdUpdated);
    },
    changeFlowId(flowItem) {
      flowItem.id = v4();
      if (flowItem.flowItems.length > 0) {
        flowItem.flowItems.forEach((flowItemChild) => {
          this.changeFlowId(flowItemChild);
        });
      }
    },
    duplicateFlowItem(parentItem, flowItem) {
      this.addFlowItem(parentItem.flowItems, flowItem);
    },
    addApiItem(parentItems, newflowItem = {
      id: "",
      name: "",
      type: "api",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: [],
      endpoint: "",
      method: "GET",
      headers: [],
      body: [],
      script: "",
      isScriptEnabled: false
    }) {
      this.addFlowItem(parentItems, newflowItem);
    },
    addConditionItem(parentItems, newflowItem = {
      id: "",
      name: "",
      type: "condition",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: [],
      condition: {
        id: v4(),
        leftSide: {
          value: "",
          valueType: "string"
        },
        comparisonOperator: "=",
        rightSide: {
          value: "",
          valueType: "string"
        }
      }
    }) {
      this.addFlowItem(parentItems, newflowItem);
    },
    changeFlowItemById(targetId, newFlowItem, setParentItem = false, parentItems = []) {
      let parentItemsTemp;
      if (setParentItem) {
        parentItemsTemp = parentItems;
      } else {
        parentItemsTemp = this.masterFlow.flowItems;
      }
      parentItemsTemp.forEach(
        (flowItem, index) => {
          if (flowItem.id == targetId) {
            parentItemsTemp[index] = newFlowItem;
            return;
          } else {
            this.changeFlowItemById(targetId, newFlowItem, true, flowItem.flowItems);
          }
        }
      );
    },
    removeFlowItemById(targetId, setParentItem = false, parentItems = []) {
      let parentItemsTemp = this.masterFlow.flowItems;
      if (setParentItem) {
        parentItemsTemp = parentItems;
      }
      parentItemsTemp.forEach(
        (flowItem, index) => {
          if (flowItem.id == targetId) {
            parentItemsTemp.splice(index, 1);
            return;
          } else {
            this.removeFlowItemById(targetId, true, flowItem.flowItems);
          }
        }
      );
    },
    applyFlowVariables(obj) {
      return applyFlowVariables(obj, this.masterFlow.variables);
    },
    applyFlowVariablesOnString(text) {
      return applyFlowVariablesOnString(text, this.masterFlow.variables);
    },
    clearLegacyData() {
      try {
        this.clearExecutionResultsFlowItem(this.masterFlow);
      } catch (e) {
        console.error("Failed to clearLegacyData:", e);
      }
    },
    clearExecutionResultsFlowItem(flowItem) {
      try {
        flowItem.executionResults = [];
        if (flowItem.flowItems.length > 0) {
          for (const flowItemChild of flowItem.flowItems) {
            this.clearExecutionResultsFlowItem(flowItemChild);
          }
        }
      } catch (e) {
        console.error("Failed to load saved flows:", e);
      }
    },
    async loadFlows() {
      const apiFlows = await $fetch(`/api/flow-store/get-flow-list`, {
        method: "GET"
      });
      if (apiFlows?.error) {
        console.error("Failed to load flows from API:", apiFlows.error);
        return;
      }
      if (apiFlows && apiFlows.length > 0) {
        this.savedFlowItems = apiFlows;
      } else {
        try {
          const lsData = JSON.parse(localStorage.getItem("saved-flow-items") || "[]");
          if (Array.isArray(lsData) && lsData.length > 0) {
            this.savedFlowItems = lsData;
            for (const flow of lsData) {
              await $fetch("/api/flow-store/save-flow", {
                method: "POST",
                body: {
                  flowItem: flow.flowItem,
                  isSaveAs: true
                }
              });
            }
            localStorage.removeItem("saved-flow-items");
          }
        } catch (e) {
          console.error("Failed to load flows from localStorage:", e);
        }
      }
    },
    async saveFlow(flowItem, isSaveAs = false) {
      const payload = {
        flowItem,
        isSaveAs,
        // 更新の場合、現在ロード済みの id を送信
        id: isSaveAs ? void 0 : this.uuuidOfLoadedSavedFlow || void 0
      };
      console.log(payload);
      try {
        const savedFlow = await $fetch("/api/flow-store/save-flow", {
          method: "POST",
          body: payload
        });
        const index = this.savedFlowItems.findIndex((item) => item.id === savedFlow.id);
        if (index !== -1) {
          this.savedFlowItems[index] = savedFlow;
        } else {
          this.savedFlowItems.push(savedFlow);
        }
        this.uuuidOfLoadedSavedFlow = savedFlow.id;
        localStorage.removeItem("saved-flow-items");
      } catch (error) {
        console.error("Failed to save flow:", error);
      }
    },
    async deleteSavedFlow(deleteIndex) {
      const flowToDelete = this.savedFlowItems[deleteIndex];
      try {
        await $fetch(`/api/flow-store/flows/${flowToDelete.id}`, {
          method: "DELETE"
        });
        this.savedFlowItems.splice(deleteIndex, 1);
        localStorage.removeItem("saved-flow-items");
      } catch (error) {
        console.error("Failed to delete flow:", error);
      }
    },
    async loadFlow(savedFlowItem) {
      try {
        const flow = await $fetch(`/api/flow-store/flows/${savedFlowItem.id}`);
        this.importFlow(flow.flowItem);
        this.uuuidOfLoadedSavedFlow = savedFlowItem.id;
      } catch (error) {
        console.error("Failed to load flow:", error);
      }
    },
    importFlow(flowItem) {
      try {
        this.masterFlow = JSON.parse(JSON.stringify(flowItem));
        this.clearLegacyData();
      } catch (e) {
        console.error(e);
      }
    },
    exportFlow(flowItem) {
      const blob = new Blob([JSON.stringify(flowItem, null, 2)], { type: "application/json" });
      const url = (void 0).URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `${flowItem.name || "flow"}.json`;
      (void 0).body.appendChild(a);
      a.click();
      (void 0).URL.revokeObjectURL(url);
      (void 0).body.removeChild(a);
    },
    addHeader(apiItem) {
      if (apiItem) {
        apiItem.headers.push({ key: "", type: "string", value: "" });
      }
    },
    removeHeader(apiItem, index) {
      if (apiItem) {
        apiItem.headers.splice(index, 1);
      }
    },
    addBodyParam(apiItem) {
      if (apiItem) {
        apiItem.body.push({ key: "", type: "string", value: "" });
      }
    },
    removeBodyParam(apiItem, index) {
      if (apiItem) {
        apiItem.body.splice(index, 1);
      }
    },
    changeConditionType(condition, type, direction) {
      let value;
      if (type == "condition") {
        value = {
          value: {
            id: v4(),
            leftSide: {
              value: "",
              valueType: "string"
            },
            comparisonOperator: "=",
            rightSide: {
              value: "",
              valueType: "string"
            }
          },
          valueType: "condition"
        };
      } else if (type == "string") {
        value = {
          value: "",
          valueType: "string"
        };
      } else if (type == "number") {
        value = {
          value: "0",
          valueType: "number"
        };
      } else {
        value = {
          value: "true",
          valueType: "boolean"
        };
      }
      if (direction == "left") {
        condition.leftSide = value;
      } else {
        condition.rightSide = value;
      }
    },
    resetCondition(condition) {
      if (condition) {
        condition.id = v4();
        condition.leftSide = {
          value: "",
          valueType: "string"
        };
        condition.comparisonOperator = "=";
        condition.rightSide = {
          value: "",
          valueType: "string"
        };
      }
    },
    evaluateCondition(condition) {
      return evaluateCondition(this.applyFlowVariables(condition));
    },
    evaluateConditionReturnByConditionValue(condition) {
      return evaluateConditionReturnByConditionValue(this.applyFlowVariables(condition));
    },
    isApiTokenRegistered() {
      if ("openAiApiKey" in this.masterFlow.variables) {
        return true;
      }
      return false;
    },
    async generateFlowItem(prompt) {
      if (!this.isApiTokenRegistered()) {
        throw new Error("The API token does not exist");
      }
      const { data, status, error, refresh, clear } = await useFetch("/api/gen-ai/execute", {
        method: "POST",
        body: {
          "prompt": prompt,
          "token": this.masterFlow.variables["openAiApiKey"]
        },
        credentials: "include"
      }, "$vQBIyOwoG7");
      if (error.value) {
        throw new Error("API error: " + error.value);
      }
      return data;
    }
    // setupWatcher() {
    //   watch(
    //     () => this.masterFlow,
    //     (newValue, oldValue) => {
    //       this.handleFlowChange(newValue, oldValue)
    //     },
    //     {
    //       deep: true,
    //       immediate: true
    //     }
    //   )
    // },
    // loadHistory(flowItem: FlowItem){
    //   this.isHistoryLoaded = true
    //   this.importFlow(flowItem)
    // },
    // handleFlowChange(newValue: FlowItem, oldValue: FlowItem) {
    //   // console.log('masterFlowの変更を検知:', {
    //   //   new: newValue,
    //   //   old: oldValue
    //   // })
    //   // 変更時の処理を実装
    //   if(this.histories.length === 0){
    //     this.histories.push(JSON.parse(JSON.stringify(this.masterFlow)))
    //   }
    //   if(this.isHistoryLoaded){
    //     this.isHistoryLoaded = false
    //     return
    //   }
    //   // if(JSON.stringify(newValue) !== JSON.stringify(this.histories[this.histories.length - 1])){
    //     this.histories.push(JSON.parse(JSON.stringify(newValue)))
    //     this.historyIndex = -1
    //   // }
    // },
    // undoHistory() {
    //   if(this.historyIndex === -1){
    //     this.historyIndex = this.histories.length - 2
    //   }else{
    //     this.historyIndex -= 1
    //   }
    //   this.masterFlow = JSON.parse(JSON.stringify(this.histories[this.historyIndex]))
    // },
    // redoHistory() {
    //   if(this.historyIndex === -1){
    //     return
    //   }else if(this.historyIndex >= this.histories.length - 1){
    //     return
    //   }else{
    //     this.historyIndex += 1
    //     this.masterFlow = JSON.parse(JSON.stringify(this.histories[this.historyIndex]))
    //   }
    // }
  }
});

export { useFlowStore as u };
//# sourceMappingURL=useFlowStore-Bci9blvY.mjs.map
