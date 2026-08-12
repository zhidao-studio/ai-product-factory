-- Admin 身份域只保留管理后台客户端。
-- H5、App、微信小程序和 HarmonyOS 的客户端配置迁入 client_application。
delete from sys_client
where client_id in (
    '428a8310cd442757ae699df5d894f051',
    '7f4c1e2d8a9b4c6f9012d3e4f5a6b7c8',
    '8f6e7d5c4b3a2910fedcba9876543210',
    '9c8b7a6d5e4f3210a1b2c3d4e5f60718'
);
