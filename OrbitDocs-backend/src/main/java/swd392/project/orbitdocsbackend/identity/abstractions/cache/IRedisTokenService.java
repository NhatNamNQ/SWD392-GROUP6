package swd392.project.orbitdocsbackend.identity.abstractions.cache;

public interface IRedisTokenService {

    void blacklistToken(String jti, long ttlMs);

    boolean isBlacklisted(String jti);
}
