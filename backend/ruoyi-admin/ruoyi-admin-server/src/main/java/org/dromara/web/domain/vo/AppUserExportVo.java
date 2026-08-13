package org.dromara.web.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.apache.fesod.sheet.annotation.ExcelIgnoreUnannotated;
import org.apache.fesod.sheet.annotation.ExcelProperty;
import org.dromara.common.excel.annotation.ExcelDictFormat;
import org.dromara.common.excel.convert.ExcelDictConvert;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Admin 应用用户导出视图对象。
 *
 * @author Lion Li
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = AppUserManagementVo.class)
public class AppUserExportVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID。
     */
    @ExcelProperty(value = "用户 ID")
    private Long userId;

    /**
     * 用户账号。
     */
    @ExcelProperty(value = "用户账号")
    private String userName;

    /**
     * 用户昵称。
     */
    @ExcelProperty(value = "用户昵称")
    private String nickName;

    /**
     * 用户邮箱。
     */
    @ExcelProperty(value = "用户邮箱")
    private String email;

    /**
     * 手机号码。
     */
    @ExcelProperty(value = "手机号码")
    private String phoneNumber;

    /**
     * 用户性别。
     */
    @ExcelProperty(value = "用户性别", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "0=男,1=女,2=未知")
    private String gender;

    /**
     * 账号状态。
     */
    @ExcelProperty(value = "账号状态", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "0=正常,1=停用")
    private String status;

    /**
     * 最后登录 IP。
     */
    @ExcelProperty(value = "最后登录 IP")
    private String loginIp;

    /**
     * 最后登录时间。
     */
    @ExcelProperty(value = "最后登录时间")
    private LocalDateTime loginDate;

}
