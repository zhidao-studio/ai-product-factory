import { DeleteOutlined, DownloadOutlined, EditOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Popconfirm, Switch } from 'antd';
import { useRef, useState } from 'react';
import type { ClientUserForm, ClientUserQuery, ClientUserVO } from '@/api/client/user/types';
import {
  addClientUser,
  changeClientUserValidFlag,
  delClientUser,
  getClientUser,
  listClientUser,
  resetClientUserPwd,
  updateClientUser
} from '@/api/client/user';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
import ClientUserFormModal from './components/ClientUserFormModal';

const defaultForm: ClientUserForm = {
  validFlag: '1'
};

const validFlagOptions = [
  { label: '有效', value: '1' },
  { label: '无效', value: '0' }
];

interface ResetPasswordForm {
  password: string;
}

export default function ClientUserPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1540);
  const [form] = Form.useForm<ClientUserForm>();
  const [resetPasswordForm] = Form.useForm<ResetPasswordForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_user_gender');
  const {
    ids: selectedIds,
    selectedOne,
    handleSelectionChange,
    clearSelection
  } = useTableSelection<ClientUserVO>(row => row.userId);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [resetPasswordOpen, { setTrue: openResetPasswordModal, setFalse: closeResetPasswordModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState<ClientUserVO>();
  const { updateExportParams, exportFile } = useTableExport();
  const { applyDateRange: applyCreateTimeDateRange } = useDateRangeQuery();

  const canAdd = hasPermi(userInfo, ['client:user:add']);
  const canEdit = hasPermi(userInfo, ['client:user:edit']);
  const canRemove = hasPermi(userInfo, ['client:user:remove']);
  const canResetPwd = hasPermi(userInfo, ['client:user:resetPwd']);
  const canExport = hasPermi(userInfo, ['client:user:export']);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultForm);
    setModalTitle('新增应用用户');
    openModal();
  };

  const openEdit = async (row?: ClientUserVO) => {
    const target = row || selectedOne;
    if (!target?.userId) return;
    const res = await getClientUser(target.userId);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改应用用户');
    openModal();
  };

  const submitForm = async (values: ClientUserForm) => {
    values.userId ? await updateClientUser(values) : await addClientUser(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row?: ClientUserVO) => {
    const targetIds = row?.userId || selectedIds;
    if (!targetIds || (Array.isArray(targetIds) && !targetIds.length)) return;
    await delClientUser(targetIds);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const toggleValidFlag = async (row: ClientUserVO, checked: boolean) => {
    const nextValidFlag = checked ? '1' : '0';
    const validText = nextValidFlag === '1' ? '有效' : '无效';
    try {
      await confirmAction(`确认要将应用用户“${row.userName}”设为${validText}吗？`);
      await changeClientUserValidFlag(row.userId, nextValidFlag);
      message.success(`已设为${validText}`);
      actionRef.current?.reload();
    } catch {
      actionRef.current?.reload();
    }
  };

  const showResetPasswordModal = (row: ClientUserVO) => {
    resetPasswordForm.resetFields();
    setResetPasswordUser(row);
    openResetPasswordModal();
  };

  const resetPassword = async ({ password }: ResetPasswordForm) => {
    if (!resetPasswordUser?.userId) return false;
    await resetClientUserPwd(resetPasswordUser.userId, password);
    message.success('密码重置成功');
    resetPasswordForm.resetFields();
    setResetPasswordUser(undefined);
    return true;
  };

  const columns: ProColumns<ClientUserVO>[] = [
    {
      title: '用户账号',
      dataIndex: 'userName',
      width: 140,
      render: (_, row) => <EllipsisText value={row.userName} maxWidth={120} />
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      width: 140,
      render: (_, row) => <EllipsisText value={row.nickName} maxWidth={120} />
    },
    {
      title: '手机号码',
      dataIndex: 'phoneNumber',
      width: 140
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      render: (_, row) => <EllipsisText value={row.email} maxWidth={160} />
    },
    {
      title: '性别',
      dataIndex: 'gender',
      search: false,
      width: 80,
      render: (_, row) => <DictTag options={dicts.sys_user_gender} value={row.gender} />
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
      title: '最后登录 IP',
      dataIndex: 'loginIp',
      search: false,
      width: 140
    },
    {
      title: '最后登录时间',
      dataIndex: 'loginDate',
      valueType: 'dateTime',
      search: false,
      width: 170
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
      width: 170
    },
    {
      title: '创建时间',
      dataIndex: 'createTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openEdit(row) },
            canResetPwd && {
              key: 'resetPwd',
              label: '重置密码',
              icon: <KeyOutlined />,
              onClick: () => showResetPasswordModal(row)
            },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除应用用户“${row.userName}”？`,
              confirmProps: { okText: '删除', okButtonProps: { danger: true } },
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="应用用户">
      <ProTable<ClientUserVO, ClientUserQuery & { createTimeRange?: [string, string] }>
        actionRef={actionRef}
        rowKey="userId"
        columns={columns}
        search={{ labelWidth: 90 }}
        scroll={tableScroll}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{ selectedRowKeys: selectedIds, onChange: handleSelectionChange }}
        request={async params => {
          const { createTimeRange, ...tableParams } = params;
          const query = applyCreateTimeDateRange(toPageQuery(tableParams), createTimeRange);
          updateExportParams(query);
          const res = await listClientUser(query);
          return toTableData(res);
        }}
        toolbar={{ title: '应用用户列表' }}
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
          canRemove && (
            <Popconfirm
              key="delete"
              title={`是否确认删除选中的 ${selectedIds.length} 个应用用户？`}
              okText="删除"
              okButtonProps={{ danger: true }}
              onConfirm={() => remove()}
            >
              <Button danger disabled={!selectedIds.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/client/user/export', () => `app_user_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          )
        ]}
      />

      <ClientUserFormModal
        open={modalOpen}
        title={modalTitle}
        form={form}
        initialValues={defaultForm}
        genderOptions={dictOptions(dicts.sys_user_gender)}
        validFlagOptions={validFlagOptions}
        onClose={closeModal}
        onFinish={submitForm}
      />

      <ModalForm<ResetPasswordForm>
        title={`重置“${resetPasswordUser?.userName || ''}”的密码`}
        open={resetPasswordOpen}
        width={480}
        form={resetPasswordForm}
        layout="vertical"
        submitter={{
          searchConfig: { submitText: '确认重置' },
          submitButtonProps: { danger: true }
        }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            closeResetPasswordModal();
            resetPasswordForm.resetFields();
            setResetPasswordUser(undefined);
          }
        }}
        onOpenChange={open => !open && closeResetPasswordModal()}
        onFinish={resetPassword}
      >
        <ProFormText.Password
          name="password"
          label="新密码"
          fieldProps={{ maxLength: 20 }}
          placeholder="请输入新密码"
          rules={[
            { required: true, message: '新密码不能为空' },
            { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间' },
            { pattern: /^[^<>"'|\\]+$/, message: `不能包含非法字符：< > " ' \\ |` }
          ]}
        />
      </ModalForm>
    </PageContainer>
  );
}
