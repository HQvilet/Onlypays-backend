package com.onlypays.in_app_purchase.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.util.Arrays;

@Configuration
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = true)
public class FlywayConfig {

    private static final Logger logger = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public Flyway flyway(DataSource dataSource, Environment env) {
        String locations = env.getProperty("spring.flyway.locations", "classpath:db/migration");
        boolean baselineOnMigrate = Boolean.parseBoolean(env.getProperty("spring.flyway.baseline-on-migrate", "true"));
        String schemas = env.getProperty("spring.flyway.schemas", env.getProperty("spring.flyway.default-schema", "in_app_purchase"));

        logger.info("Initializing Flyway for schemas: {}, locations: {}", schemas, locations);
        String[] schemaArray = StringUtils.commaDelimitedListToStringArray(schemas);
        String defaultSchema = schemaArray.length > 0 ? schemaArray[0].trim() : "in_app_purchase";

        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations(locations)
                .baselineOnMigrate(baselineOnMigrate)
                .schemas(schemaArray)
                .defaultSchema(defaultSchema)
                .createSchemas(true)
                .load();

        logger.info("Starting Flyway database migration...");
        var result = flyway.migrate();
        logger.info("Flyway database migration completed successfully. Executed {} migrations.", result.migrationsExecuted);

        return flyway;
    }

    @Bean
    public static BeanFactoryPostProcessor entityManagerFactoryDependsOnFlyway() {
        return beanFactory -> {
            if (beanFactory.containsBeanDefinition("entityManagerFactory")) {
                BeanDefinition def = beanFactory.getBeanDefinition("entityManagerFactory");
                String[] dependsOn = def.getDependsOn();
                if (dependsOn == null || dependsOn.length == 0) {
                    def.setDependsOn("flyway");
                } else if (!Arrays.asList(dependsOn).contains("flyway")) {
                    String[] newDependsOn = Arrays.copyOf(dependsOn, dependsOn.length + 1);
                    newDependsOn[dependsOn.length] = "flyway";
                    def.setDependsOn(newDependsOn);
                }
                logger.info("Configured entityManagerFactory to depend on flyway bean.");
            }
        };
    }
}
