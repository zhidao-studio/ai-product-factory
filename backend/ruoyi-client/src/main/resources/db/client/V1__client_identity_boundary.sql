create table if not exists client_user (
    user_id        bigint not null auto_increment comment '产品用户ID',
    username       varchar(64) not null comment '产品用户登录名',
    phone_number   varchar(32) default null comment '手机号',
    email          varchar(128) default null comment '邮箱',
    password       varchar(100) default null comment 'BCrypt密码',
    nickname       varchar(64) not null default '' comment '昵称',
    avatar         varchar(500) default null comment '头像',
    status         char(1) not null default '0' comment '0正常 1停用',
    del_flag       char(1) not null default '0' comment '0存在 1删除',
    create_time    datetime not null default current_timestamp,
    update_time    datetime not null default current_timestamp on update current_timestamp,
    primary key (user_id),
    unique key uk_client_user_username (username),
    unique key uk_client_user_phone (phone_number),
    unique key uk_client_user_email (email)
) engine=innodb comment='产品用户表，与 Admin sys_user 完全隔离';

create table if not exists client_application (
    id                     bigint not null auto_increment,
    client_id              varchar(64) not null comment '公开客户端ID',
    client_key             varchar(32) not null comment '客户端标识',
    client_secret          varchar(255) default null comment '服务端密钥，公共客户端可为空',
    grant_types            varchar(255) not null comment '允许的登录方式',
    device_type            varchar(32) not null comment '设备类型',
    timeout_seconds        bigint not null default 604800,
    active_timeout_seconds bigint not null default 1800,
    status                 char(1) not null default '0',
    create_time            datetime not null default current_timestamp,
    update_time            datetime not null default current_timestamp on update current_timestamp,
    primary key (id),
    unique key uk_client_application_client_id (client_id),
    unique key uk_client_application_client_key (client_key)
) engine=innodb comment='用户端客户端应用配置';

create table if not exists client_identity (
    id          bigint not null auto_increment,
    user_id     bigint not null,
    source      varchar(64) not null comment '外部身份来源',
    open_id     varchar(255) not null,
    union_id    varchar(255) default null,
    create_time datetime not null default current_timestamp,
    primary key (id),
    unique key uk_client_identity_source_openid (source, open_id),
    key idx_client_identity_user_id (user_id),
    constraint fk_client_identity_user foreign key (user_id) references client_user(user_id)
) engine=innodb comment='产品用户外部身份绑定';

insert into client_application
    (client_id, client_key, grant_types, device_type, timeout_seconds, active_timeout_seconds, status)
values
    ('8f6e7d5c4b3a2910fedcba9876543210', 'h5', 'password,sms,phonePassword', 'h5', 604800, 1800, '0'),
    ('428a8310cd442757ae699df5d894f051', 'app', 'password,sms,phonePassword', 'app', 604800, 1800, '0'),
    ('7f4c1e2d8a9b4c6f9012d3e4f5a6b7c8', 'miniapp', 'password,xcx', 'miniapp', 604800, 1800, '0'),
    ('9c8b7a6d5e4f3210a1b2c3d4e5f60718', 'harmony', 'password,sms,phonePassword', 'harmony', 604800, 1800, '0')
on duplicate key update
    grant_types = values(grant_types),
    device_type = values(device_type),
    update_time = current_timestamp;

insert into client_user
    (user_id, username, phone_number, password, nickname, status, del_flag)
values
    (2000000000000000001, 'client', '13800138000', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '示例产品用户', '0', '0')
on duplicate key update nickname = values(nickname), update_time = current_timestamp;
