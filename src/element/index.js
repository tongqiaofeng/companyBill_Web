// 导入自己需要的组件
import {
  Form,
  FormItem,
  Select,
  Option,
  Input,
  Button,
  Container,
  Header,
  Aside,
  Main,
  Pagination,
  Dialog,
  Table,
  TableColumn,
  DatePicker,
  Tooltip,
  Tabs,
  TabPane,
  Radio,
  Autocomplete,

  Message,
  Loading
} from 'element-ui'

const element = {
  install: function (Vue) {
    Vue.use(Form)
    Vue.use(FormItem)
    Vue.use(Select)
    Vue.use(Option)
    Vue.use(Input)
    Vue.use(Button)
    Vue.use(Container)
    Vue.use(Header)
    Vue.use(Aside)
    Vue.use(Main)
    Vue.use(Pagination)
    Vue.use(Dialog)
    Vue.use(Table)
    Vue.use(TableColumn)
    Vue.use(DatePicker)
    Vue.use(Tooltip)
    Vue.use(Tabs)
    Vue.use(TabPane)
    Vue.use(Radio)
    Vue.use(Autocomplete)

    Vue.use(Loading.directive)

    Vue.prototype.$message = Message;
    Vue.prototype.$loading = Loading.service;
  }
}
export default element