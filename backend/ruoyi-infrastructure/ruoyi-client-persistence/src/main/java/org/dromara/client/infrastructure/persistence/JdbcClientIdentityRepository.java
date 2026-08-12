package org.dromara.client.infrastructure.persistence;

import org.dromara.client.domain.model.ClientApplication;
import org.dromara.client.domain.model.ClientExternalIdentity;
import org.dromara.client.domain.model.ClientUser;
import org.dromara.client.domain.port.ClientApplicationRepository;
import org.dromara.client.domain.port.ClientUserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Client 身份域 JDBC 适配器。 */
@Repository
public class JdbcClientIdentityRepository implements ClientUserRepository, ClientApplicationRepository {

    private static final RowMapper<ClientUser> USER_ROW_MAPPER = (rs, rowNum) -> new ClientUser(
        rs.getLong("user_id"),
        rs.getString("username"),
        rs.getString("phone_number"),
        rs.getString("email"),
        rs.getString("password"),
        rs.getString("nickname"),
        rs.getString("avatar"),
        rs.getString("status")
    );

    private final JdbcTemplate jdbcTemplate;

    public JdbcClientIdentityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<ClientUser> findByUsername(String username) {
        return first(jdbcTemplate.query("""
            select user_id, username, phone_number, email, password, nickname, avatar, status
              from client_user
             where username = ? and del_flag = '0'
            """, USER_ROW_MAPPER, username));
    }

    @Override
    public Optional<ClientUser> findByPhone(String phone) {
        return first(jdbcTemplate.query("""
            select user_id, username, phone_number, email, password, nickname, avatar, status
              from client_user
             where phone_number = ? and del_flag = '0'
            """, USER_ROW_MAPPER, phone));
    }

    @Override
    public Optional<ClientUser> findByExternalIdentity(String source, String openId) {
        return first(jdbcTemplate.query("""
            select u.user_id, u.username, u.phone_number, u.email, u.password, u.nickname, u.avatar, u.status
              from client_identity i
              join client_user u on u.user_id = i.user_id and u.del_flag = '0'
             where i.source = ? and i.open_id = ?
            """, USER_ROW_MAPPER, source, openId));
    }

    @Override
    @Transactional
    public ClientUser createFromExternalIdentity(ClientExternalIdentity identity, String nickname) {
        String username = "wx_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                insert into client_user(username, nickname, status, del_flag, create_time, update_time)
                values (?, ?, '0', '0', current_timestamp, current_timestamp)
                """, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, username);
            statement.setString(2, nickname);
            return statement;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("创建产品用户失败：数据库未返回主键");
        }
        long userId = key.longValue();
        jdbcTemplate.update("""
            insert into client_identity(user_id, source, open_id, union_id, create_time)
            values (?, ?, ?, ?, current_timestamp)
            """, userId, identity.source(), identity.openId(), identity.unionId());
        return new ClientUser(userId, username, null, null, null, nickname, null, "0");
    }

    @Override
    public Optional<ClientApplication> findByClientId(String clientId) {
        return first(jdbcTemplate.query("""
            select client_id, client_key, grant_types, device_type, timeout_seconds,
                   active_timeout_seconds, status
              from client_application
             where client_id = ?
            """, (rs, rowNum) -> new ClientApplication(
                rs.getString("client_id"),
                rs.getString("client_key"),
                rs.getString("grant_types"),
                rs.getString("device_type"),
                rs.getLong("timeout_seconds"),
                rs.getLong("active_timeout_seconds"),
                rs.getString("status")
            ), clientId));
    }

    private static <T> Optional<T> first(List<T> values) {
        return values.stream().findFirst();
    }
}
