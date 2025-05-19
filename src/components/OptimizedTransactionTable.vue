<template>
  <div class="candidate-table-container">
    <h3>Real-Time Transactions</h3>

    <div class="scroller" ref="scrollContainer" @scroll="onScroll">
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div
          v-for="(tx, index) in visibleTransactions"
          :key="tx.n"
          class="row"
          :style="{
            position: 'absolute',
            top: (startIndex + index) * rowHeight + 'px',
          }"
        >
          <div class="cell">{{ tx.t }}</div>
          <div class="cell">{{ tx.p }}</div>
          <div class="cell">{{ tx.v }}</div>
          <div class="cell">{{ tx.u }}</div>
        </div>
      </div>
    </div>

    <div class="stats">Total Transactions: {{ transactions.length }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  TransactionService,
  type Transaction,
} from "@/services/TransactionService";
import { SCROLL_CONFIG, TRANSACTION_CONFIG } from "@/constants/config";

const transactionService = new TransactionService();
const transactions = ref<Transaction[]>([]);

const rowHeight = SCROLL_CONFIG.ROW_HEIGHT;
const viewHeight = SCROLL_CONFIG.VIEWPORT_HEIGHT;
const buffer = SCROLL_CONFIG.BUFFER_ROWS;

const initialBatchSize = TRANSACTION_CONFIG.INITIAL_BATCH;
const updateIntervalMs = TRANSACTION_CONFIG.UPDATE_INTERVAL_MS;
const maxTransactions = TRANSACTION_CONFIG.MAX_TRANSACTIONS;

const scrollContainer = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const shouldAutoScroll = ref(true);

const totalHeight = computed(() => transactions.value.length * rowHeight);

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / rowHeight))
);
const endIndex = computed(() =>
  Math.min(
    transactions.value.length,
    startIndex.value + Math.ceil(viewHeight / rowHeight) + buffer
  )
);

const visibleTransactions = computed(() =>
  transactions.value.slice(startIndex.value, endIndex.value)
);

const onScroll = () => {
  if (!scrollContainer.value) return;

  scrollTop.value = scrollContainer.value.scrollTop;
  shouldAutoScroll.value = scrollTop.value < 50;
};

const loadInitialTransactions = () => {
  const batch: Transaction[] = [];
  for (let i = 0; i < initialBatchSize; i++) {
    batch.unshift(transactionService.generate());
  }
  transactions.value = batch;
};

let intervalId: number | undefined;

onMounted(() => {
  loadInitialTransactions();

  intervalId = setInterval(() => {
    transactions.value.unshift(transactionService.generate());

    if (transactions.value.length > maxTransactions) {
      transactions.value.length = maxTransactions;
    }

    const scroller = scrollContainer.value;
    if (!scroller) return;

    if (shouldAutoScroll.value) {
      scroller.scrollTop = 0;
      return;
    }

    scroller.scrollTop += rowHeight;
  }, updateIntervalMs);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped lang="scss">
.scroller {
  max-height: 400px;
  overflow-y: auto;
  position: relative;
  border: 1px solid #ddd;
}

.row {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  font-family: monospace;
  background: white;
  width: 100%;

  &:hover {
    background-color: #ddd;
  }
}

.cell {
  flex: 1;
  padding-right: 10px;
}

.stats {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}

.candidate-table-container {
  max-width: 800px;
  width: 100%;
  margin: auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
}
</style>
