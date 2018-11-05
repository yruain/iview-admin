<template>
    <Form
        ref="editForm"
        class="edit-form"
        :model="formData"
        :rules="rules"
        :inline="inline"
        :label-width="labelWidth"
        :show-message="showMessage"
        :autocomplete="autocomplete"
     >
        <FormItem
           v-for="(form, index) in forms" :key="index"
           :prop="form.prop"
           :label="form.label + ':'"
           :label-for="form.labelFor"
           :label-width="form.labelWidth"
           :requierd="form.requierd"
           :rules="form.rules"
           :error="form.error"
           :show-message="form.showMessage"
        >
            <Input v-if="form.tag === 'input' || form.tag === undefined"
              v-model="formData[form.prop]"
              :readonly="form.readonly"
              :disabled="form.disabled || form.readonly"
              :placeholder="form.placeholder"
              :key="form.prop+'_' + index"
               />

              <Select v-else-if="form.tag === 'select'" 
                v-model="formData[form.prop]"
                :readonly="form.readonly"
                :disabled="form.disabled || form.readonly"
                :placeholder="form.placeholder"
                :key="form.prop+'_' + index"
                >
                <i-option v-for="(option, optionIndex) in parseOptions(form.options)"
                    :key="form.prop +'_option' + optionIndex"
                    :value="option[form.valueKey || 'value']"
                  >
                    {{ option[form.labelKey || 'label']}}
                </i-option>
            </Select>

              <RadioGroup v-else-if="form.tag === 'radio'" 
                :value="formData[form.prop]"
                :readonly="form.readonly"
                :disabled="form.disabled || form.readonly"
                :placeholder="form.placeholder"
                :key="form.prop+'_' + index"
                >
                <Radio v-for="(option, optionIndex) in parseOptions(form.options)"
                     :key="form.prop +'_radio' + optionIndex"
                    :value="option[form.valueKey || 'value']"
                    :label="option[form.labelKey || 'label']"
                    :true-value="option[form.trueValue || 'trueValue']"
                    :false-value="option[form.falseValue || 'falseValue']"
                  >
                </Radio>

              </RadioGroup>
              <CheckboxGroup v-else-if="form.tag === 'checkbox'" 
              :value="formData[form.prop]"
              :readonly="form.readonly"
              :disabled="form.disabled || form.readonly"
              :placeholder="form.placeholder"
              :key="form.prop+'_' + index"
              >
                <Checkbox v-for="(option, optionIndex) in parseOptions(form.options)"
                      :key="form.prop +'_checkbox' + optionIndex"
                    :value="option[form.valueKey || 'value']"
                    :label="option[form.labelKey || 'label']"
                    :true-value="option[form.trueValue || 'trueValue']"
                    :false-value="option[form.falseValue || 'falseValue']"
                  >
                </Checkbox>
              </CheckboxGroup>
        </FormItem>

        <FormItem class="form-item-button">
          <Button v-if="showSubmit" type="primary" @click="handleSubmit" >{{submitText}}</Button>
          <Button v-if="showReset" @click="handleReset">{{resetText}}</Button>
          <slot name="formButton"></slot>
        </FormItem>
     </Form>
    
</template>

<script>
  import './index.less'

  export default {
  name: 'EditForm',
    props: {
      forms: {
        type: [Array,Function],
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
        default: 80
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
      },
      showMessage: {
        type: Boolean,
        default () {
          return true
        }
      },
      autocomplete:{
        type: String,
        default () {
          return 'off'
        }
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
            _this.$emit("on-validate-ok",valid);
          } else{
            _this.$emit("on-validate-error",valid);
            console.debug("validate Fail!");
            //this.$Message.error('Fail!');
          }
        });
      },
      handleReset(){
        this.$refs.editForm.resetFields();
        this.$emit("on-after-reset");
      },
      // 解析options
      parseOptions(options){
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

