import { DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Switch } from 'antd';
import { useRef, useState } from 'react';
import type {
  ClientApplicationForm,
  ClientApplicationQuery,
  ClientApplicationVO
} from '@/api/client/application/types';
import {
  addClientApplication,
  changeClientApplicationValidFlag,
  getClientApplication,
  listClientApplication,
  updateClientApplication
} from '@/api/client/application';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useUserStore } from '@/stores/userStore';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const defaultForm: ClientApplicationForm = {
  validFlag: '1'
};

const validFlagOptions = [
  { label: '有效', value: '1' },
  { label: '无效', value: '0' }
];

const grantTypeOptions = [
  { label: '密码认证', value: 'password' },
  { label: '手机号密码认证', value: 'phonePassword' },
  { label: '短信认证', value: 'sms' },
  { label: '小程序认证', value: 'xcx' }
];

const deviceTypeOptions = [
  { label: 'H5', value: 'h5' },
  { label: 'App', value: 'app' },
  { label: '微信小程序', value: 'miniapp' },
  { label: 'HarmonyOS', value: 'harmony' }
];

const deviceGrantTypeMap: Record<string, readonly string[]> = {
  h5: ['password', 'sms'],
  app: ['phonePassword', 'sms'],
  miniapp: ['xcx'],
  harmony: ['password', 'sms']
};

const grantTypeLabelMap = Object.fromEntries(grantTypeOptions.map(item => [item.value, item.label]));
const deviceTypeLabelMap = Object.fromEntries(deviceTypeOptions.map(item => [item.value, item.label]));

function getRuleList(ruleList?: string[], ruleValue?: string) {
  if (Array.isArray(ruleList) && ruleList.length) return ruleList;
  if (!ruleValue) return [];
  return ruleValue
    .split(/[\n,;]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

export default function ClientApplicationPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1750);
  const [form] = Form.useForm<ClientApplicationForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const { ids, selectedOne, handleSelectionChange } = useTableSelection<ClientApplicationVO>(
    row => row.id
  );
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const { updateExportParams, exportFile } = useTableExport();

  const canAdd = hasPermi(userInfo, ['client:application:add']);
  const canEdit = hasPermi(userInfo, ['client:application:edit']);
  const canExport = hasPermi(userInfo, ['client:application:export']);
  const editingApplication = !!Form.useWatch('id', form);
  const selectedDeviceType = Form.useWatch('deviceType', form);
  const availableGrantTypeOptions = grantTypeOptions.filter(option =>
    (deviceGrantTypeMap[selectedDeviceType || ''] || []).includes(option.value)
  );

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultForm);
    setModalTitle('新增接入客户端');
    openModal();
  };

  const openEdit = async (row?: ClientApplicationVO) => {
    const target = row || selectedOne;
    if (!target?.id) return;
    const res = await getClientApplication(target.id);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改接入客户端');
    openModal();
  };

  const submitForm = async (values: ClientApplicationForm) => {
    values.id ? await updateClientApplication(values) : await addClientApplication(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const toggleValidFlag = async (row: ClientApplicationVO, checked: boolean) => {
    const nextValidFlag = checked ? '1' : '0';
    const validText = nextValidFlag === '1' ? '有效' : '无效';
    try {
      await confirmAction(`确认要将接入客户端“${row.clientKey}”设为${validText}吗？`);
      await changeClientApplicationValidFlag(row.id, nextValidFlag);
      message.success(`已设为${validText}`);
      actionRef.current?.reload();
    } catch {
      actionRef.current?.reload();
    }
  };

  const columns: ProColumns<ClientApplicationVO>[] = [
    {
      title: '客户端 ID',
      dataIndex: 'clientId',
      width: 190,
      render: (_, row) => <EllipsisText value={row.clientId} maxWidth={170} />
    },
    {
      title: '客户端 Key',
      dataIndex: 'clientKey',
      width: 170,
      render: (_, row) => <EllipsisText value={row.clientKey} maxWidth={150} />
    },
    {
      title: '授权类型',
      dataIndex: 'grantType',
      search: false,
      width: 160,
      render: (_, row) =>
        getRuleList(row.grantTypeList, row.grantType)
          .map(grantType => grantTypeLabelMap[grantType] || grantType)
          .join('、') || '-'
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      valueType: 'select',
      fieldProps: { options: deviceTypeOptions },
      width: 120,
      render: (_, row) => deviceTypeLabelMap[row.deviceType || ''] || row.deviceType || '-'
    },
    {
      title: '允许访问路径',
      dataIndex: 'accessPath',
      search: false,
      width: 200,
      render: (_, row) => {
        const rules = getRuleList(row.accessPathList, row.accessPath);
        return rules.length ? <EllipsisText value={rules.join(', ')} maxWidth={180} /> : '全部路径';
      }
    },
    {
      title: 'IP 白名单',
      dataIndex: 'ipWhitelist',
      search: false,
      width: 190,
      render: (_, row) => {
        const rules = getRuleList(row.ipWhitelistList, row.ipWhitelist);
        return rules.length ? <EllipsisText value={rules.join(', ')} maxWidth={170} /> : '全部 IP';
      }
    },
    {
      title: 'Token 活跃超时',
      dataIndex: 'activeTimeout',
      search: false,
      width: 150
    },
    {
      title: 'Token 固定超时',
      dataIndex: 'timeout',
      search: false,
      width: 150
    },
    {
      title: '是否有效',
      dataIndex: 'validFlag',
      valueType: 'select',
      fieldProps: { options: validFlagOptions },
      width: 100,
      render: (_, row) => (
        <Switch
          checked={row.validFlag === '1'}
          checkedChildren="有效"
          unCheckedChildren="无效"
          disabled={!canEdit}
          onChange={checked => toggleValidFlag(row, checked)}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
      width: 170
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openEdit(row) }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="接入客户端">
      <ProTable<ClientApplicationVO, ClientApplicationQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 95 }}
        scroll={tableScroll}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const query = toPageQuery(params);
          updateExportParams(query);
          const res = await listClientApplication(query);
          return toTableData(res);
        }}
        toolbar={{ title: '接入客户端列表' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              新增
            </Button>
          ),
          canEdit && (
            <Button key="edit" disabled={!selectedOne} icon={<EditOutlined />} onClick={() => openEdit()}>
              修改
            </Button>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/client/application/export', () => `app_client_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          )
        ]}
      />

      <ModalForm<ClientApplicationForm>
        title={modalTitle}
        open={modalOpen}
        width={760}
        form={form}
        layout="vertical"
        initialValues={defaultForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="id" hidden />
        <ProFormText name="clientId" hidden />
        <ProFormText
          name="clientKey"
          label="客户端 Key"
          rules={[{ required: true, message: '客户端 Key 不能为空' }]}
          fieldProps={{ disabled: editingApplication }}
        />
        {!editingApplication && (
          <ProFormText.Password
            name="clientSecret"
            label="客户端密钥"
            rules={[{ required: true, message: '客户端密钥不能为空' }]}
          />
        )}
        <ProFormSelect
          name="deviceType"
          label="设备类型"
          rules={[{ required: true, message: '设备类型不能为空' }]}
          options={deviceTypeOptions}
          fieldProps={{ onChange: () => form.setFieldValue('grantTypeList', []) }}
        />
        <ProFormSelect
          name="grantTypeList"
          label="授权类型"
          rules={[{ required: true, message: '授权类型不能为空' }]}
          mode="multiple"
          options={availableGrantTypeOptions}
          fieldProps={{ disabled: !selectedDeviceType }}
        />
        <ProFormTextArea
          name="accessPath"
          label="允许访问路径"
          fieldProps={{ rows: 4, placeholder: '多个路径可按换行、逗号或分号分隔；为空表示允许访问所有接口路径' }}
        />
        <ProFormTextArea
          name="ipWhitelist"
          label="IP 白名单"
          fieldProps={{ rows: 4, placeholder: '支持精确 IP、通配符和 CIDR；为空表示允许所有 IP' }}
        />
        <div className="form-grid">
          <ProFormDigit name="activeTimeout" label="Token 活跃超时时间" min={0} />
          <ProFormDigit name="timeout" label="Token 固定超时时间" min={0} />
        </div>
        <ProFormRadio.Group name="validFlag" label="是否有效" options={validFlagOptions} />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} placeholder="请输入内容" />
      </ModalForm>
    </PageContainer>
  );
}
