package org.dromara.client;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;

/** H5、App、微信小程序和 HarmonyOS 的统一 Client 启动程序。 */
@SpringBootApplication(scanBasePackages = "org.dromara")
public class ClientApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(ClientApplication.class);
        application.setApplicationStartup(new BufferingApplicationStartup(2048));
        application.run(args);
        System.out.println("Client 用户业务服务启动成功");
    }
}
