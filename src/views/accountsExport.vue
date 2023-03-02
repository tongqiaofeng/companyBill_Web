<template>
  <div style="margin-top: -20px; overflow: hidden" id="billReportContainer">
    <div class="bill-report-container">
      <!-- 账单报表 -->
      <div v-if="pageSel == 0">
        <div style="text-align: left">
          <el-form inline label-width="55px">
            <el-form-item label="日期：">
              <el-date-picker
                v-model="time"
                type="daterange"
                range-separator="至"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="公司">
              <el-select
                style="width: 100%"
                v-model="companyId"
                placeholder="请选择"
              >
                <el-option
                  v-for="(item, index) in companyList"
                  :key="index"
                  :label="item.companyName"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="账户">
              <el-select
                style="width: 100%"
                v-model="personId"
                placeholder="请选择"
              >
                <el-option
                  v-for="(item, index) in userList"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="标签">
              <el-select
                style="width: 100%"
                placeholder="可多选"
                v-model="labelSels"
                multiple
                clearable
              >
                <el-option
                  v-for="item in labelList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="">
              <el-input
                style="width: 360px"
                v-model="keyword"
                placeholder="可输入账单备注进行查询"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="">
              <el-button type="primary" @click="personChange">查询</el-button>
            </el-form-item>
            <el-form-item label="">
              <el-button type="primary" @click="exportData">导出数据</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-show="isCompany == 0">
          <el-tabs v-model="activeName">
            <el-tab-pane label="统计列表" name="first">
              <el-table
                :data="accountList"
                style="width: 800px"
                border
                @row-dblclick="checkThisList"
              >
                <el-table-column align="center" width="80px">
                  <template slot-scope="scope">
                    <div>
                      {{ ++scope.$index }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="信息">
                  <template slot-scope="scope">
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      "
                    >
                      <div style="display: flex; align-items: center">
                        <span style="font-size: 14px">公司欠</span>
                        <span>{{ scope.row.staffName }}</span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="欠款总数">
                  <template slot-scope="scope">
                    <div>
                      <span
                        :style="{
                          color:
                            scope.row.allTotalSettleAmount < 0
                              ? 'red'
                              : '#606266',
                        }"
                        >{{ formatNumberRgx(scope.row.allTotalSettleAmount)
                        }}<span style="margin-left: 5px; font-size: 12px">{{
                          scope.row.currency
                        }}</span></span
                      >
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="记录列表" name="second">
              <el-table
                border
                :data="billList"
                style="width: 100%"
                @row-click="delBill"
                @row-dblclick="updateBill"
                v-loading="loadingTable"
                element-loading-text="加载中..."
                element-loading-spinner="el-icon-loading"
              >
                <el-table-column align="center" prop="time" label="日期">
                  <template slot-scope="scope">
                    <div
                      :style="{
                        color:
                          isRed(scope.row.flag, scope.row.totalSettleAmount) ==
                          1
                            ? 'red'
                            : '#606266',
                      }"
                    >
                      {{ scope.row.time }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="tradeType"
                  label="收入/支出"
                >
                  <template slot-scope="scope">
                    <div
                      :style="{
                        color:
                          isRed(scope.row.flag, scope.row.totalSettleAmount) ==
                          1
                            ? 'red'
                            : '#606266',
                      }"
                    >
                      {{ tradeTypeRgx(scope.row.tradeType) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="foreignAmount"
                  label="外币金额"
                >
                  <template slot-scope="scope">
                    <div
                      :style="{
                        color:
                          isRed(scope.row.flag, scope.row.totalSettleAmount) ==
                          1
                            ? 'red'
                            : '#606266',
                      }"
                    >
                      {{
                        isFanMoney(
                          scope.row.flag,
                          scope.row.totalSettleAmount,
                          scope.row.foreignAmount,
                          scope.row.currency
                        )
                      }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="totalToSettleRate"
                  label="汇率"
                >
                  <template slot-scope="scope">
                    <div
                      :style="{
                        color:
                          isRed(scope.row.flag, scope.row.totalSettleAmount) ==
                          1
                            ? 'red'
                            : '#606266',
                      }"
                    >
                      {{
                        scope.row.totalToSettleRate == ""
                          ? "/"
                          : scope.row.totalToSettleRate
                      }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="totalSettleAmount"
                  label="人民币金额"
                >
                  <template slot-scope="scope">
                    <div
                      :style="{
                        color:
                          isRed(scope.row.flag, scope.row.totalSettleAmount) ==
                          1
                            ? 'red'
                            : '#606266',
                      }"
                    >
                      {{
                        isFanHkPrice(
                          scope.row.flag,
                          scope.row.totalSettleAmount
                        )
                      }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="receiveType"
                  label="交易方式"
                >
                  <template slot-scope="scope">
                    <div
                      :style="{
                        color:
                          isRed(scope.row.flag, scope.row.totalSettleAmount) ==
                          1
                            ? 'red'
                            : '#606266',
                      }"
                    >
                      {{ scope.row.receiveType }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  width="250px"
                  align="center"
                  prop="remark"
                  label="Remarks"
                >
                  <template slot-scope="scope">
                    <div
                      :style="{
                        color:
                          isRed(scope.row.flag, scope.row.totalSettleAmount) ==
                          1
                            ? 'red'
                            : '#606266',
                      }"
                    >
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="scope.row.remark"
                        placement="top-start"
                      >
                        <div class="font-warp">{{ scope.row.remark }}</div>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="操作">
                  <template>
                    <div>
                      <span style="color: #409eff; cursor: pointer">刪除</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div style="margin-top: 15px; text-align: right">
                <el-pagination
                  @current-change="handleCurrentChange"
                  :current-page="page"
                  layout="total, prev, pager, next, jumper"
                  :total="total"
                >
                </el-pagination>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-show="isCompany == 1">
          <div class="right-title" v-if="personAllMoney !== 0">
            公司欠{{ personName + "总数 " }}
            <span
              :style="{
                color: personAllMoney < 0 ? 'red' : '#000',
              }"
              >{{ formatNumberRgx(personAllMoney)
              }}<span style="margin-left: 5px; font-size: 12px">CNY</span></span
            >
          </div>
          <el-table
            border
            :data="billList"
            style="width: 100%"
            @row-click="delBill"
            @row-dblclick="updateBill"
            v-loading="loadingTable"
            element-loading-text="加载中..."
            element-loading-spinner="el-icon-loading"
          >
            <el-table-column align="center" prop="time" label="日期">
              <template slot-scope="scope">
                <div
                  :style="{
                    color:
                      isRed(scope.row.flag, scope.row.totalSettleAmount) == 1
                        ? 'red'
                        : '#606266',
                  }"
                >
                  {{ scope.row.time }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="tradeType" label="收入/支出">
              <template slot-scope="scope">
                <div
                  :style="{
                    color:
                      isRed(scope.row.flag, scope.row.totalSettleAmount) == 1
                        ? 'red'
                        : '#606266',
                  }"
                >
                  {{ tradeTypeRgx(scope.row.tradeType) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="foreignAmount"
              label="外币金额"
            >
              <template slot-scope="scope">
                <div
                  :style="{
                    color:
                      isRed(scope.row.flag, scope.row.totalSettleAmount) == 1
                        ? 'red'
                        : '#606266',
                  }"
                >
                  {{
                    isFanMoney(
                      scope.row.flag,
                      scope.row.totalSettleAmount,
                      scope.row.foreignAmount,
                      scope.row.currency
                    )
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="totalToSettleRate"
              label="汇率"
            >
              <template slot-scope="scope">
                <div
                  :style="{
                    color:
                      isRed(scope.row.flag, scope.row.totalSettleAmount) == 1
                        ? 'red'
                        : '#606266',
                  }"
                >
                  {{
                    scope.row.totalToSettleRate == ""
                      ? "/"
                      : scope.row.totalToSettleRate
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="totalSettleAmount"
              label="人民币金额"
            >
              <template slot-scope="scope">
                <div
                  :style="{
                    color:
                      isRed(scope.row.flag, scope.row.totalSettleAmount) == 1
                        ? 'red'
                        : '#606266',
                  }"
                >
                  {{
                    isFanHkPrice(scope.row.flag, scope.row.totalSettleAmount)
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="receiveType" label="交易方式">
              <template slot-scope="scope">
                <div
                  :style="{
                    color:
                      isRed(scope.row.flag, scope.row.totalSettleAmount) == 1
                        ? 'red'
                        : '#606266',
                  }"
                >
                  {{ scope.row.receiveType }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              width="250px"
              align="center"
              prop="remark"
              label="Remarks"
            >
              <template slot-scope="scope">
                <div
                  :style="{
                    color:
                      isRed(scope.row.flag, scope.row.totalSettleAmount) == 1
                        ? 'red'
                        : '#606266',
                  }"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    :content="scope.row.remark"
                    placement="top-start"
                  >
                    <div class="font-warp">{{ scope.row.remark }}</div>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template>
                <div>
                  <span style="color: #409eff; cursor: pointer">刪除</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 15px; text-align: right">
            <el-pagination
              @current-change="handleCurrentChange"
              :current-page="page"
              layout="total, prev, pager, next, jumper"
              :total="total"
            >
            </el-pagination>
          </div>
        </div>
        <el-dialog
          title="删除该账单"
          :visible.sync="dialogDelVisible"
          width="500px"
        >
          <div style="text-align: center; font-size: 16px">
            确定删除该账单？删除后不能恢复
          </div>
          <div slot="footer">
            <el-button @click="dialogDelVisible = false">取 消</el-button>
            <el-button type="primary" @click="delBillSure">确 定</el-button>
          </div>
        </el-dialog>
      </div>
      <div v-else style="width: 60%">
        <div
          style="
            width: 60px;
            margin: 0 0 20px 30px;
            display: flex;
            justify-content: space-between;
            cursor: pointer;
          "
          @click="goback"
        >
          <img src="../assets/imgs/goback.png" style="height: 21px" />
          <p style="margin: 0">返回</p>
        </div>
        <el-form
          ref="billForm"
          :model="billData"
          :rules="billRules"
          label-width="125px"
        >
          <el-form-item label="账单日期" prop="time">
            <el-date-picker
              type="date"
              placeholder="请选择账单日期"
              v-model="billData.time"
              style="width: 100%"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="公司" prop="companyId">
            <el-select
              style="width: 100%"
              v-model="billData.companyId"
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in companyList"
                :key="index"
                :label="item.companyName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="交易类型" prop="tradeType">
            <el-select
              style="width: 100%"
              v-model="tradeSel"
              placeholder="请选择"
              @change="tradeTypeChange"
              value-key="id"
            >
              <el-option
                v-for="(item, index) in tradeTypeList"
                :key="index"
                :label="item.tradeType"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item :label="personShow(billData.tradeType)" prop="personId">
            <el-select
              style="width: 100%"
              v-model="billData.personId"
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in userList"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="收款账户"
            v-show="billData.tradeType == 11"
            prop="payeeId"
          >
            <el-select
              style="width: 100%"
              v-model="billData.payeeId"
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in userList"
                :key="index"
                :label="item.name"
                :value="item.id"
                v-show="item.id != billData.personId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="交易方式" prop="receiveType">
            <el-autocomplete
              style="width: 100%"
              class="inline-input"
              v-model="billData.receiveType"
              :fetch-suggestions="querySearch"
              placeholder="请选择/输入内容"
              @select="handleSelect"
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              style="width: 100%"
              placeholder="请选择/输入标签，输入多个用,隔开"
              v-model="labelVals"
              filterable
              multiple
              allow-create
              default-first-option
              clearable
            >
              <el-option
                v-for="item in labelList"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="外币金额" prop="foreignAmount">
            <div style="display: flex">
              <el-input
                v-model="billData.foreignAmount"
                placeholder="请输入外币金额"
                @change="hkMoneyNum"
              ></el-input>
              <el-select
                v-model="billData.currencyId"
                placeholder="请选择金额币种"
              >
                <el-option
                  v-for="item in currencyIds"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </el-form-item>
          <el-form-item label="外币转人民币汇率" prop="totalToSettleRate">
            <el-input
              v-model="billData.totalToSettleRate"
              placeholder="请输入"
              @input="hkMoneyNum"
            ></el-input>
          </el-form-item>
          <el-form-item label="人民币金额" prop="totalSettleAmount">
            <el-input
              style="width: 100%"
              v-model="billData.totalSettleAmount"
              placeholder="请输入金额"
              @change="hkNum"
            ></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              style="width: 100%"
              type="textarea"
              v-model="billData.remark"
              placeholder="请输入备注信息"
            ></el-input>
          </el-form-item>
          <el-form-item label="图片">
            <div style="display: flex">
              <div class="upload-imgs">
                <div class="add">
                  <form
                    enctype="multipart/form-data"
                    style="width: 100px; height: 100px"
                  >
                    <input
                      @change="inputChange($event)"
                      type="file"
                      name="upload-images"
                      accept="image/*"
                      class="inputUpload"
                      multiple
                    />
                    <i class="el-icon-plus addIcon"></i>
                  </form>
                </div>

                <div
                  v-for="(item, index) of imgSrcs"
                  :key="index"
                  style="margin-left: 10px; position: relative"
                >
                  <span class="spanStyle" @click="delImage2(item, index)"
                    >x</span
                  >
                  <img
                    :src="baseUrl + '/' + item"
                    width="100px"
                    height="100px"
                    style="border-radius: 5px; object-fit: cover"
                  />
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
        <div
          style="display: flex; justify-content: flex-end; text-align: right"
        >
          <el-button
            style="width: 120px"
            type="primary"
            @click="updateBillSure"
          >
            修改
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: this.$store.state.baseUrl,
      pageSel: 0,
      time: "",
      keyword: "",
      personId: "",
      userList: [],

      page: 1,
      total: 0,
      personAllMoney: 0,
      billList: [],
      tradeTypeList: [],

      imgSrcs: [],
      labelVals: [],
      tradeSel: {},
      billData: {},
      billRules: {
        companyId: [
          {
            required: true,
            message: "请选择公司",
            trigger: "change",
          },
        ],
        personId: [
          {
            required: true,
            message: "请选择账户",
            trigger: "change",
          },
        ],
        time: [
          {
            required: true,
            message: "请选择账单日期",
            trigger: "change",
          },
        ],
        tradeType: [
          {
            required: true,
            message: "请选择交易类型",
            trigger: "change",
          },
        ],
        payeeId: [
          {
            required: false,
            message: "请选择收款账户",
            trigger: "change",
          },
        ],
        foreignAmount: [
          {
            required: false,
            message: "请输入外币金额",
            trigger: "blur",
          },
        ],
        totalSettleAmount: [
          {
            required: true,
            message: "请输入金额",
            trigger: "blur",
          },
        ],
      },
      currencyIds: [
        {
          value: 1,
          label: "CNY人民币",
        },
        {
          value: 2,
          label: "HKD港币",
        },
        {
          value: 3,
          label: "USD美元",
        },
        {
          value: 4,
          label: "EUR欧元",
        },
        {
          value: 5,
          label: "GBP英镑",
        },
        {
          value: 6,
          label: "AUD澳元",
        },
      ],
      meansList: [],

      dialogDelVisible: false,
      delId: null,
      personName: "",

      isCompany: 1,
      accountList: [],

      loading: null,
      loadingTable: false,

      activeName: "first",

      currencyGlobal: "CNY",
      labelList: [],
      labelSels: [],
      companyList: [],
      companyId: "",
    };
  },
  created() {
    this.getBillUserList();
    this.getMeansList();
    this.getLabelList();
    this.getTradeTypeList();
  },
  methods: {
    // 公司下查看选中账户账单
    checkThisList(row) {
      this.personId = row.personId;
      this.personName = row.staffName;
      this.isCompany = 1;
      this.page = 1;

      this.getBillList();
    },
    // 是否为红色
    isRed(flag, hkPrice) {
      if (flag == 1) {
        if (this.isCompany == 0) {
          return -1;
        } else {
          let price = hkPrice > 0 ? "-" + hkPrice : Math.abs(hkPrice);
          if (Number(price) < 0) {
            return 1;
          } else {
            return -1;
          }
        }
      } else {
        if (this.isCompany == 0) {
          return 1;
        } else {
          if (Number(hkPrice) < 0) {
            return 1;
          } else {
            return -1;
          }
        }
      }
    },
    // 外币金额是否取反
    isFanMoney(flag, hkPrice, money, currency) {
      if (money == "" || money == null || money == 0) {
        return "/";
      } else {
        if (flag == 1) {
          if (this.isCompany == 0) {
            let price = hkPrice < 0 ? Math.abs(money) : money;
            let num = this.formatNumberRgx(price) + " " + currency;
            return num;
          } else {
            let price = hkPrice > 0 ? "-" + money : Math.abs(money);

            let num = this.formatNumberRgx(price) + " " + currency;
            return num;
          }
        } else {
          if (this.isCompany == 0) {
            let price = hkPrice > 0 ? "-" + money : money;
            let num = this.formatNumberRgx(price) + " " + currency;
            return num;
          } else {
            let num = this.formatNumberRgx(money) + " " + currency;
            return num;
          }
        }
      }
    },
    // 收入  港币金额取反，判断正负，支出 直接看港币金额的正负
    // 港币金额是否取反
    isFanHkPrice(flag, hkPrice) {
      if (hkPrice == "" || hkPrice == null || hkPrice == 0) {
        return "/";
      } else {
        if (flag == 1) {
          if (this.isCompany == 0) {
            let price = hkPrice < 0 ? Math.abs(hkPrice) : hkPrice;
            let num = this.formatNumberRgx(price) + " " + this.currencyGlobal;
            return num;
          } else {
            let price = hkPrice > 0 ? "-" + hkPrice : Math.abs(hkPrice);

            let num = this.formatNumberRgx(price) + " " + this.currencyGlobal;
            return num;
          }
        } else {
          if (this.isCompany == 0) {
            let price = hkPrice > 0 ? "-" + hkPrice : hkPrice;
            let num = this.formatNumberRgx(price) + " " + this.currencyGlobal;
            return num;
          } else {
            let num = this.formatNumberRgx(hkPrice) + " " + this.currencyGlobal;
            return num;
          }
        }
      }
    },
    // 支出賬戶/收款賬戶
    personShow(value) {
      for (const item of this.tradeTypeList) {
        if (item.id == value) {
          if (item.flag == 1) {
            return "收款账户";
          } else if (item.flag == 0 || item.flag == -1) {
            return "支出账户";
          }
        }
      }

      return "支出账户";
    },
    // 修改賬單
    updateBill(row) {
      console.log(row);

      this.billData = JSON.parse(JSON.stringify(row));
      for (const item of this.tradeTypeList) {
        if (item.id == this.billData.tradeType) {
          this.tradeSel = item;
        }
      }

      this.imgSrcs = [];
      if (this.billData.pics) {
        if (this.billData.pics.indexOf("|") == -1) {
          this.imgSrcs.push(this.billData.pics);
        } else {
          this.imgSrcs = this.billData.pics.split("|");
        }
      }

      this.labelVals = [];
      if (this.billData.label) {
        if (this.billData.label.indexOf(",") == -1) {
          this.labelVals.push(this.billData.label);
        } else {
          this.labelVals = this.billData.label.split(",");
        }
      }

      if (this.billData.tradeType == 11) {
        this.billRules.payeeId[0].required = true;
      } else {
        this.billRules.payeeId[0].required = false;
      }

      this.pageSel = 1;
      document
        .getElementById("billReportContainer")
        .scrollIntoView({ behavior: "smooth" });
    },
    // 確定修改
    updateBillSure() {
      this.$refs["billForm"].validate((valid) => {
        if (valid) {
          this.billData.pics = this.imgSrcs.join("|");
          for (const index in this.labelVals) {
            this.labelVals[index] = this.labelVals[index].replace("，", ",");
          }
          this.billData.label = this.labelVals.join(",");

          this.$axios
            .post(this.baseUrl + "/api/bill/update", this.billData)
            .then((res) => {
              console.log("修改账单信息");
              console.log(res);
              if (res.status === 200) {
                this.$message.success({
                  message: "账单信息修改成功",
                  showClose: true,
                  duration: 2000,
                });

                this.pageSel = 0;
                this.page = 1;
                this.getBillList();

                document
                  .getElementById("billReportContainer")
                  .scrollIntoView({ behavior: "smooth" });
              }
            })
            .catch((err) => {
              console.log(err);
              this.$message.error({
                message: err.data.status,
                showClose: true,
                duration: 3000,
              });
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 删除账单
    delBill(row, column) {
      if (column.label == "操作") {
        this.delId = row.id;
        this.dialogDelVisible = true;
      }
    },
    // 確定刪除
    delBillSure() {
      this.$axios
        .get(this.baseUrl + "/api/bill/delete?id=" + this.delId)
        .then((res) => {
          console.log("删除账单信息");
          console.log(res);
          if (res.status === 200) {
            this.$message.success({
              message: "账单删除成功",
              showClose: true,
              duration: 2000,
            });
            this.dialogDelVisible = false;

            this.page = 1;
            this.getBillList();

            document
              .getElementById("billReportContainer")
              .scrollIntoView({ behavior: "smooth" });
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.error({
            message: err.data.status,
            showClose: true,
            duration: 3000,
          });
        });
    },
    // 導出數據
    exportData() {
      const loading = this.$loading({
        lock: true,
        text: "导出中...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

      let time1 = this.time != "" && this.time != null ? this.time[0] : "";
      let time2 = this.time != "" && this.time != null ? this.time[1] : "";
      this.$axios
        .get(
          this.baseUrl +
            "/api/bill/billExport?id=" +
            this.personId +
            "&startTime=" +
            time1 +
            "&endTime=" +
            time2 +
            "&companyId=" +
            this.companyId,
          {
            responseType: "blob",
          }
        )
        .then((res) => {
          console.log("导出报表");
          console.log(res);
          loading.close();

          const link = document.createElement("a");
          let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          let num = "";
          for (let i = 0; i < 10; i++) {
            num += Math.ceil(Math.random() * 10);
          }
          link.setAttribute("download", "账单报表_" + num + ".xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((err) => {
          console.log(err);
          loading.close();
          this.$message.error({
            message: err.data.status,
            showClose: true,
            duration: 2000,
          });
        });
    },
    // 根據外币金額計算人民币金額
    hkMoneyNum() {
      this.billData.foreignAmount = this.getPriceNum(
        this.billData.foreignAmount
      );

      if (this.billData.currencyId == 1) {
        this.billData.totalSettleAmount = Number(
          this.billData.foreignAmount
        ).toFixed(0);
      } else {
        if (
          this.billData.foreignAmount != "" &&
          this.billData.foreignAmount != 0 &&
          this.billData.totalToSettleRate != ""
        ) {
          if (
            this.billData.currencyId == 2 &&
            this.billData.totalToSettleRate < 1
          ) {
            this.billData.totalSettleAmount = (
              this.billData.foreignAmount * this.billData.totalToSettleRate
            ).toFixed(0);
          } else {
            this.billData.totalSettleAmount = (
              this.billData.foreignAmount / this.billData.totalToSettleRate
            ).toFixed(0);
          }
        }
      }
    },

    // 港幣數字的獲取
    hkNum() {
      this.billData.totalSettleAmount = this.getPriceNum(
        this.billData.totalSettleAmount
      );
    },
    // 交易類型變化
    tradeTypeChange() {
      this.billData.tradeType = this.tradeSel.id;
      console.log(this.billData.tradeType);
      if (this.billData.tradeType == 11) {
        this.billRules.payeeId[0].required = true;
      } else {
        this.billRules.payeeId[0].required = false;
      }
    },
    // 交易方式輸入/匹配
    querySearch(queryString, cb) {
      console.log(typeof queryString);
      let restaurants = this.meansList;

      for (let items of restaurants) {
        items.value = items.name;
      }

      let results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSelect(item) {
      console.log(item);
      this.billData.receiveType = item.value;
    },
    goback() {
      this.pageSel = 0;
    },
    // 獲取交易方式列表
    getMeansList() {
      this.$axios
        .get(this.baseUrl + "/api/bill/receiveTypeList")
        .then((res) => {
          console.log("交易方式列表");
          console.log(res);
          this.meansList = [];
          if (res.data.length > 0) {
            for (const item of res.data) {
              if (item != "" && item != null) {
                this.meansList.push({
                  name: item,
                });
              }
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 获取交易类型列表
    getTradeTypeList() {
      this.$axios
        .get(this.baseUrl + "/api/bill/tradeTypeList")
        .then((res) => {
          console.log("交易类型列表");
          console.log(res);
          this.tradeTypeList = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 获取公司列表
    getCompanyList() {
      this.$axios
        .get(this.baseUrl + "/api/staff/companyList")
        .then((res) => {
          console.log("公司列表列表");
          console.log(res);

          this.companyList = res.data.data;
          this.companyId = this.companyList[0].id;

          this.getBillList();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 獲取标签列表
    getLabelList() {
      this.$axios
        .get(this.baseUrl + "/api/bill/labelList")
        .then((res) => {
          console.log("标签列表");
          console.log(res);
          this.labelList = [];
          if (res.data.length > 0) {
            for (const item of res.data) {
              if (item != "" && item != null) {
                this.labelList.push({
                  name: item,
                });
              }
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 賬戶改變
    personChange() {
      this.page = 1;
      for (const item of this.userList) {
        if (item.id == this.personId) {
          console.log(item);
          this.personName = item.name;
          if (item.type == 0) {
            this.isCompany = 0;
            this.activeName = "first";
          } else {
            this.isCompany = 1;
          }
        }
      }
      console.log(this.personId);

      this.getBillList();
    },
    // 獲取賬單列表
    getBillList() {
      this.loadingTable = true;
      console.log(this.time);
      this.$axios
        .post(
          this.baseUrl +
            "/api/bill/billSearch?page=" +
            this.page +
            "&pageNum=10",
          {
            personId: this.personId,
            startTime:
              this.time !== "" && this.time !== null ? this.time[0] : "",
            endTime: this.time !== "" && this.time !== null ? this.time[1] : "",
            keyword: this.keyword,
            flag: 2,
            label: this.labelSels.join(","),
            companyId: this.companyId,
          }
        )
        .then((res) => {
          console.log("账单列表");
          console.log(res);
          this.loadingTable = false;

          this.accountList = res.data.data.censusList;
          this.billList = res.data.data.allRecordRes.detailList;
          this.total = res.data.data.allRecordRes.total;
          this.personAllMoney = res.data.data.allRecordRes.allTotalSettleAmount;
        })
        .catch((err) => {
          this.loadingTable = false;
          console.log(err);
        });
    },
    // 獲取用戶列表
    getBillUserList() {
      this.$axios
        .post(this.baseUrl + "/api/staff/staffList")
        .then((res) => {
          console.log("用户列表");
          console.log(res);
          this.userList = res.data.data;

          this.personId = this.userList[0].id;
          if (this.userList[0].type == 0) {
            this.isCompany = 0;
          } else {
            this.isCompany = 1;
          }
          this.getCompanyList();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 分頁
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.page = val;
      console.log(this.page);
      this.getBillList();

      document
        .getElementById("billReportContainer")
        .scrollIntoView({ behavior: "smooth" });
    },
    // 账单类型匹配
    tradeTypeRgx(item) {
      for (let i = 0; i < this.tradeTypeList.length; ++i) {
        if (item == this.tradeTypeList[i].id)
          return this.tradeTypeList[i].tradeType;
      }
      return "";
    },

    // 上传图片
    inputChange(e) {
      let file = e.target.files;
      let that = this;
      if (file[0] == undefined) {
        return;
      } else {
        this.loading = this.$loading({
          lock: true,
          text: "图片上传中...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });

        for (let item of file) {
          console.log(item);
          // 文件大于2M，进行压缩上传
          if (item.size / 1024 > 2050) {
            this.photoCompress2(
              item,
              {
                // 调用压缩图片方法
                quality: 0.7,
              },
              function (base64Codes) {
                let bl = that.base64UrlToBlob2(base64Codes);
                that.uploadLice2(bl); // 请求图片上传接口
              }
            );
          } else {
            // 小于等于2M 原图上传
            this.uploadLice2(item);
          }
        }
      }
    },
    // base64 转 Blob 格式 和file格式
    base64UrlToBlob2(urlData) {
      let mime = urlData.split(",")[0].match(/:(.*?);/)[1], // image/jpeg
        n = atob(urlData.split(",")[1]).length, // window.atob() 对接受到的 base64 数据进行解码,得到原数据
        u8arr = new Uint8Array(n); // 创建初始化为0的，包含n个元素的无符号整型数组
      while (n--) {
        u8arr[n] = atob(urlData.split(",")[1]).charCodeAt(n);
      }

      // 转blob
      // return new Blob([u8arr], {type: mime})
      let filename = Date.parse(new Date()) + ".jpg";
      // 转file
      return new File([u8arr], filename, {
        type: mime,
      });
    },
    photoCompress2(file, obj, callback) {
      let that = this;
      let ready = new FileReader(); //实例化一个reader文件
      /* 开始读取指定File对象中的内容. 读取操作完成时,返回一个URL格式的字符串. */
      ready.readAsDataURL(file); // 添加二进制文件
      ready.onload = function (event) {
        let re = event.target.result;
        that.canvasDataURL2(re, obj, callback); // 开始压缩
      };
    },
    canvasDataURL2(path, obj, callback) {
      let img = new Image();
      img.src = path;
      img.onload = function () {
        let that = this; // 指到img
        // 默认按比例压缩
        let w = that.width,
          h = that.height,
          scale = w / h;
        w = obj.width || w;
        h = obj.height || w / scale;
        let quality = 0.7; // 默认图片质量为0.7
        // 生成canvas
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        // 创建属性节点
        let anw = document.createAttribute("width");
        anw.nodeValue = w;
        let anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        // 铺底色
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(that, 0, 0, w, h);

        // 图像质量
        if (obj.quality && obj.quality >= 1 && obj.quality < 0) {
          quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        let base64 = canvas.toDataURL("image/jpeg", quality);
        // 回调函数返回base64的值
        callback(base64);
      };
    },
    //  返回file文件，调用接口执行上传
    uploadLice2(file) {
      console.log("图片file", file);
      let formdata = new FormData(); //创建form对象
      formdata.append("files", file); //通过append向form对象添加数据
      formdata.append("type", 1);

      this.$axios
        .post(this.baseUrl + "/api/file/upload", formdata)
        .then((res) => {
          if (res.status == 200) {
            this.$message.success({
              message: "图片上传成功",
              showClose: true,
              duration: 2000,
            });
          }
          console.log(res);
          this.loading.close();
          this.imgSrcs.push(res.data.data);
        })
        .catch((err) => {
          this.loading.close();
          console.log(err);
          this.$message.error({
            message: err.data.status,
            showClose: true,
            duration: 2000,
          });
        });
    },
    // 刪除图片
    delImage2(item, index) {
      console.log(item, index);
      this.imgSrcs.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.bill-report-container {
  padding: 20px;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 6px;

  .user-every {
    margin-bottom: 10px;
  }

  .code-table {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .add-button {
      width: 200px;
      height: 40px;
      margin: 0 auto;
      margin-top: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #c3c3c3;
      border-radius: 10px;
      cursor: pointer;

      img {
        width: 32px;
        height: 32px;
        margin-right: 10px;
      }
    }

    .every1,
    .every2,
    .every3,
    .every4,
    .every5 {
      display: flex;
      justify-content: center;
      text-align: center;
      align-items: center;
    }

    .every1 {
      width: 15%;
    }

    .every2 {
      width: 40%;
    }

    .every3 {
      width: 17%;
    }
    .every4 {
      width: 13%;
    }

    .every5 {
      width: 10%;
    }
  }
  .right-title {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 16px;
  }

  .upload-imgs {
    width: 100%;
    margin-bottom: 10px;
    // position: relative;
    display: flex;
    flex-wrap: wrap;

    .add {
      width: 100px;
      height: 100px;
      position: relative;
      border: 1px solid #ddd;
      border-radius: 5px;

      .addIcon {
        width: 14px;
        height: 14px;
        position: absolute;
        top: 50%-7;
        left: 50%-7;
        z-index: 1;
      }

      .inputUpload {
        width: 100px;
        height: 100px;
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        opacity: 0;
        cursor: pointer;
        z-index: 999;
      }
    }

    .spanStyle {
      width: 15px;
      height: 15px;
      position: absolute;
      top: 1px;
      right: 1px;
      text-align: center;
      line-height: 0.8;
      background-color: rgb(221, 221, 221);
      color: rgb(255, 255, 255);
      border: 1px solid rgb(221, 221, 221);
      border-radius: 50%;
      z-index: 9;
      cursor: pointer;
    }
  }
}
</style>
