package com.onlypays.in_app_purchase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class InAppPurchaseApplication {

	public static void main(String[] args) {
		SpringApplication.run(InAppPurchaseApplication.class, args);
	}

}
