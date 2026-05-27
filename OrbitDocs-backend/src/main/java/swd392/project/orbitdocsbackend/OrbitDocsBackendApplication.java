package swd392.project.orbitdocsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class OrbitDocsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrbitDocsBackendApplication.class, args);
    }

}
