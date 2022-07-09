<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0;">
      <el-input
        v-model="query.value"
        clearable
        class="filter-item"
        style="width: 200px;"
        size="small"
        placeholder="请输入社交账号名称内容"
        @keyup.enter.native="handleFind"
      />
      <el-select v-model="form.providerId" clearable placeholder="类型" class="filter-item" size="small" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="handleFind">查找</el-button>
      <el-button class="filter-item" size="small" type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" style="width: 100%" size="mini">

      <el-table-column type="selection" />
      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="providerId" label="社交账号类型" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.providerId }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="displayName" label="社交账号名称" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.displayName }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="userName" label="系统账号名称" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="头像" width="150" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.imageUrl" width="40" height="40" class="head_pic">
        </template>
      </el-table-column>

      <el-table-column label="绑定时间" width="160" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" min-width="150" align="center">
        <template slot-scope="scope">
          <el-button slot="reference" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">解绑账号</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <div class="pagination">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="handleCurrentChange"
      />
    </div>
    <!--新增-->
    <el-dialog :append-to-body="true" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="社交账号类型" :label-width="formLabelWidth">
          <el-select v-model="form.providerId" placeholder="请选择账号类型" style="width: 100%">
            <el-option v-for="item in dateScopes" :key="item.id" :label="item.value" :value="item.value" />{{ 空 }}
          </el-select></el-form-item>
        <el-form-item label="社交账号名称" prop="displayName" :label-width="formLabelWidth">
          <el-input v-model="form.displayName" style="width: 100%;" placeholder="请输入社交账号名称" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime" :label-width="formLabelWidth">
          <el-date-picker v-model="form.createTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择开始日期时间" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialog = false">取消</el-button>
        <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getSocialList, untied } from '@/api/social'
import { parseTime } from '@/utils/index'
import { saveSocial, updateSocial } from '../../api/social'

export default {
  data() {
    return {
      providerId: '空',
      loading: false,
      isAdd: false,
      tableData: [],
      title: '',
      dialogFormVisible: false, // 控制弹出框
      dialog: false,
      formLabelWidth: '120px',
      isEditForm: false,
      currentPage: 1,
      pageSize: 20,
      total: 0, // 总数量
      // 分类菜单列表
      deptData: [],
      // tree配置项
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
      dateScopes: [{
        value: 'github'
      },
      {
        value: 'qq'
      },
      {
        value: 'weixin'
      },
      {
        value: '空'
      }
      ],
      form: {
        providerId: '',
        displayName: '',
        createTime: '',
        userName: ''
      },
      // 表单校验
      dataRule: {
        jobName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }]
      },
      rules: {
        providerId: [
          { required: true, message: '社交账号类型不为空', trigger: 'blur' }
        ],
        displayName: [
          { required: true, message: '社交账号名称不为空', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '系统账号名称不为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'gitee', display_name: 'gitee' },
        { key: 'github', display_name: 'github' },
        { key: 'qq', display_name: 'qq' }
      ],
      query: {
        providerId: '',
        value: ''
      }
    }
  },
  created() {
    this.getSocialList()
  },
  methods: {
    parseTime,
    getSocialList: function() {
      this.loading = true
      const params = new URLSearchParams()
      params.append('current', this.currentPage)
      params.append('size', this.pageSize)
      if (this.query.providerId !== '') {
        params.append('providerId', this.query.providerId)
        params.append('displayName', this.query.value)
      }
      getSocialList(params).then(response => {
        this.loading = false
        this.tableData = response.data.data.records
        this.total = response.data.data.total
      })
    },
    // 查找
    handleFind: function() {
      this.getSocialList()
    },
    // 换页
    handleCurrentChange: function(val) {
      this.currentPage = val
      this.getSocialList()
    },

    handleDelete: function(row) {
      const that = this
      this.$confirm('此操作将解绑社交登录账号, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = new URLSearchParams()
          params.append('userId', row.userId)
          params.append('providerId', row.providerId)
          untied(params).then(response => {
            if (response.data.code === 200) {
              this.$message({
                type: 'success',
                message: '操作成功'
              })
              that.getSocialList()
            } else {
              this.$message({
                type: 'error',
                message: response.data.msg
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消解绑账号'
          })
        })
    },
    // 社交账号提交动作
    doSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.isAdd) {
            // 新增社交账号
            saveSocial(this.form).then((res) => {
              if (res.data.code === 200) {
                this.$message({ message: '操作成功', type: 'success' })
              } else {
                this.$message({ message: res.data.msg, type: 'error' })
              }
              this.dialog = false
              this.$refs['form'].resetFields()
            })
          } else {
            // 更新社交账号
            updateSocial(this.form).then((res) => {
              if (res.data.code === 200) {
                this.$message({ message: '操作成功', type: 'success' })
              } else {
                this.$message({ message: res.data.msg, type: 'error' })
              }
              this.dialog = false
            })
          }
        }
      })
    },
    // 添加社交账号
    handleAdd: function() {
      this.dialog = true
      this.isAdd = true
      this.form = {}
    },
    // 编辑社交账号
    handleEdit: function(row) {
      this.dialog = true
      this.isAdd = false
      this.form = row
    }
  }
}
</script>
