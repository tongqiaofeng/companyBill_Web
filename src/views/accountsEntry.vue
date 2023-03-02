<template>
  <div style="margin-top: -20px; overflow: hidden" id="billEntryContainer">
    <div class="bill-entry-container">
      <!-- <div>账单录入</div> -->
      <div class="container-left">
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
              @change="companyChange"
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
          <el-form-item :label="personShow()" prop="personId">
            <el-select
              style="width: 100%"
              v-model="billData.personId"
              placeholder="请选择"
              @change="personChange"
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
            style="margin-right: 50px"
            type="primary"
            @click="clearForm"
          >
            重置
          </el-button>
          <el-button v-if="billData.id" type="primary" @click="updateBillSure"
            >修改</el-button
          >
          <el-button v-else type="primary" @click="submitData">提交</el-button>
        </div>
      </div>
      <div class="container-right">
        <el-table
          :data="billList"
          style="width: 100%"
          tooltip-effect="dark"
          border
          highlight-current-row
          @row-click="delBill"
          @row-dblclick="updateBill"
          v-loading="loadingTable"
          element-loading-text="加载中..."
          element-loading-spinner="el-icon-loading"
        >
          <el-table-column align="center" prop="time" label="账单日期">
          </el-table-column>
          <el-table-column align="center" prop="tradeType" label="交易类型">
            <template slot-scope="scope">
              <div>
                {{ tradeTypeRgx(scope.row.tradeType) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="foreignAmount" label="外币金额">
            <template slot-scope="scope">
              <div>
                {{
                  scope.row.foreignAmount == "" ||
                  scope.row.foreignAmount == 0 ||
                  scope.row.foreignAmount == null
                    ? "/"
                    : formatNumberRgx(scope.row.foreignAmount) +
                      " " +
                      scope.row.currency
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
              <div>
                {{
                  scope.row.totalSettleAmount == "" ||
                  scope.row.totalSettleAmount == 0 ||
                  scope.row.totalSettleAmount == null
                    ? "/"
                    : formatNumberRgx(scope.row.totalSettleAmount) + " CNY"
                }}
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
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: this.$store.state.baseUrl,
      imgSrcs: [],
      tradeSel: {},
      labelVals: [],
      billData: {
        personId: "",
        time: new Date(),
        tradeType: "",
        companyId: "",
        payeeId: "",
        foreignAmount: "",
        currencyId: "",
        totalToSettleRate: "",
        totalSettleAmount: "",
        receiveType: "",
        remark: "",
        label: "",
        pics: "",
      },
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
      userList: [],
      tradeTypeList: [],
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
      billList: [],

      dialogDelVisible: false,
      delId: null,

      labelList: [],
      loading: null,
      loadingTable: false,

      companyList: [],
    };
  },
  created() {
    this.$nextTick(() => {
      document
        .getElementById("billEntryContainer")
        .scrollIntoView({ behavior: "smooth" });
    });

    this.getBillUserList();
    this.getMeansList();
    this.getLabelList();
    this.getTradeTypeList();
    this.getCompanyList();

    let date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    let d = date.getDate();
    d = d < 10 ? "0" + d : d;
    const time = y + "-" + m + "-" + d;
    this.billData.time = time;
  },
  methods: {
    // 选择公司变化
    companyChange() {
      for (const item of this.companyList) {
        if (item.id == this.billData.companyId) {
          this.billData.currencyId = item.currencyId;
        }
      }
    },
    // 修改賬單
    updateBill(row) {
      this.billData = JSON.parse(JSON.stringify(row));
      console.log(this.billData);
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
      console.log(this.labelVals);

      if (this.billData.tradeType == 11) {
        this.billRules.payeeId[0].required = true;
      } else {
        this.billRules.payeeId[0].required = false;
      }
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
                let name = this.billData.personId;

                this.$refs.billForm.resetFields();
                this.billData.id = null;
                this.billData.currencyId = "";
                this.billData.totalToSettleRate = "";

                this.billData.personId = name;
                this.imgSrcs = [];
                this.labelVals = [];
                this.getLabelList();
                this.getBillList();

                document
                  .getElementById("billEntryContainer")
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

            this.getBillList();

            document
              .getElementById("billEntryContainer")
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
    // 重置表單
    clearForm() {
      let name = this.billData.personId;

      this.$refs.billForm.resetFields();
      this.billData.id = null;
      this.billData.currencyId = "";
      this.billData.totalToSettleRate = "";

      this.billData.personId = name;
      this.imgSrcs = [];
      this.labelVals = [];
    },
    // 提交數據
    submitData() {
      this.$refs["billForm"].validate((valid) => {
        if (valid) {
          this.billData.id = null;
          this.billData.pics = this.imgSrcs.join("|");
          for (const index in this.labelVals) {
            this.labelVals[index] = this.labelVals[index].replace("，", ",");
          }
          this.billData.label = this.labelVals.join(",");

          this.$axios
            .post(this.baseUrl + "/api/bill/insert", this.billData)
            .then((res) => {
              console.log("提交账单信息");
              console.log(res);
              if (res.status === 200) {
                this.$message.success({
                  message: "账单录入成功",
                  showClose: true,
                  duration: 2000,
                });

                this.billData.payeeId = "";
                this.billData.foreignAmount = "";
                this.billData.totalToSettleRate = "";
                this.billData.totalSettleAmount = "";
                this.billData.remark = "";
                this.imgSrcs = [];

                this.getLabelList();
                this.getBillList();

                document
                  .getElementById("billEntryContainer")
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
    // 賬戶類型為員工
    personChange() {
      this.getBillList();
    },

    // 根據總金額計算總港幣金額
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

    // 獲取賬單列表
    getBillList() {
      this.loadingTable = true;
      console.log(this.billData.personId);
      this.$axios
        .post(this.baseUrl + "/api/bill/billSearch?page=1&pageNum=10", {
          personId: this.billData.personId,
          companyId: this.billData.companyId,
          flag: 1,
        })
        .then((res) => {
          this.loadingTable = false;
          console.log("账单列表");
          console.log(res);
          this.billList = res.data.data.allRecordRes.detailList;
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
        })
        .catch((err) => {
          console.log(err);
        });
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
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 千分钱数
    formatNumberRgx(num) {
      if (num == "" || num == null || num == 0) {
        return 0;
      } else {
        let parts = num.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      }
    },
    // 账单类型匹配
    tradeTypeRgx(item) {
      for (let i = 0; i < this.tradeTypeList.length; ++i) {
        if (item == this.tradeTypeList[i].id)
          return this.tradeTypeList[i].tradeType;
      }
      return "";
    },
    // 支出賬戶/收款賬戶
    personShow() {
      if (this.tradeSel.flag == 1) {
        return "收款账户";
      } else if (this.tradeSel.flag == 0 || this.tradeSel.flag == -1) {
        return "支出账户";
      } else {
        return "支出账户";
      }
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
          if (item.size / 1024 > 2050) {
            this.photoCompress2(
              item,
              {
                quality: 0.7,
              },
              function (base64Codes) {
                let bl = that.base64UrlToBlob2(base64Codes);
                that.uploadLice2(bl);
              }
            );
          } else {
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

      let filename = Date.parse(new Date()) + ".jpg";
      return new File([u8arr], filename, {
        type: mime,
      });
    },
    photoCompress2(file, obj, callback) {
      let that = this;
      let ready = new FileReader();
      ready.readAsDataURL(file);
      ready.onload = function (event) {
        let re = event.target.result;
        that.canvasDataURL2(re, obj, callback);
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
    // 刪除圖片
    delImage2(item, index) {
      console.log(item, index);
      this.imgSrcs.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.bill-entry-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;

  .container-left {
    padding: 20px;
    margin-right: 20px;
    background-color: #fff;
    border-radius: 6px;
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
  }

  .container-left {
    width: 59%;
  }
  .container-right {
    width: 39%;
  }

  .container-right {
    padding: 20px;
    margin-right: 20px;
    background-color: #fff;
    border-radius: 6px;
    .right-title {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
    }
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
