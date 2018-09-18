<template>
    <Form
        ref="editForm"
        class="edit-form"
        :model="formData"
        :rules="rules"
        :inline="inline"
        :label-width="labelWidth"
     >
        <FormItem
           v-for="(form, index) in forms" :key="index"
           :prop="form.prop"
           :label="form.label + ':'"
           :label-width="form.labelWidth"
        >

            <Input v-if="form.type === 'input' || form.type === undefined"
              v-model="formData[form.prop]"
              :readonly="form.readonly"
              :disabled="form.disabled"
              :placeholder="form.placeholder"
               />

              <Select v-else-if="form.type === 'select'" 
                v-model="formData[form.prop]"
                :readonly="form.readonly"
                :disabled="form.disabled"
                :placeholder="form.placeholder"
                >
                <i-option v-for="(option, optionIndex) in parseSelectOptions(form.options)"
                    :key="optionIndex + '_local'"
                    :value="(typeof option === 'object') ? option[form.valueKey || 'value'] : option"
                  >
                    {{(typeof option === 'object') ? option[form.labelKey || 'label'] : option}}
                </i-option>
            </Select>
        </FormItem>

        <FormItem class="form-item-button">
          <Button v-if="showSubmit" type="primary" @click="handleSubmit" >{{submitText}}</Button>
          <Button v-if="showReset" @click="handleReset">{{resetText}}</Button>
        </FormItem>
     </Form>
    
</template>

<script>
  import './index.less'

  export default {
  name: 'EditForm',
    props: {
      forms: {
        type: Array,
        default () {
          return []
        }
      },
      formData:{
        type: Object,
        default () {
          return {}
        }
      },
      rules:{
        type: [Object],
        default() {
          return {}
        }
      },
      /**
       * @description 全局设置是否可编辑
       */
      isEdit: {
        type: [Boolean,String],
        default: false
      },
      labelWidth: {
        type: Number,
        default: 60
      },
      inline: {
        type: [Boolean],
        default: false
      },
      // 显示提交按钮
      showSubmit: {
        type: [Boolean,String],
        default: false
      },
      // 字符串
      submitText: {
        type: String,
        default: "submit"
      },
      // 重置按钮
      showReset: {
        type: [Boolean,String],
        default: false
      },
      // 字符串
      resetText: {
        type: String,
        default: "reset"
      }
    },
    data(){
      const _this = this;
      return {
        _this : _this
       
      }
    },
    computed: {
     
    },
    filters: {
      
    },
    methods:{
      handleSubmit(){
        const _this = this;
        this.$refs.editForm.validate(valid => {
          if(valid){
            this.$emit("on-after-validate",valid);
          }
        });
      },
      handleReset(){
        this.$refs.editForm.resetFields();
         this.$emit("on-after-reset");
      },
      // 解析options
      parseSelectOptions(options){
          let option = options;
          if (typeof options == 'function'){
            option =  options.apply(this.$parent)
          }
          
         return option;
      }
      
    }
  }
</script>

<style >

</style>

