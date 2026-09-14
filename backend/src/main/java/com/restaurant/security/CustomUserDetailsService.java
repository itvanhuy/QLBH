package com.restaurant.security;

import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

/**
 * Implement UserDetailsService của Spring Security.
 * Spring Security gọi loadUserByUsername() khi cần xác thực user.
 *
 * "Username" ở đây thực ra là EMAIL vì chúng ta dùng email để đăng nhập.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user từ database theo email.
     * Được gọi bởi:
     *   1. AuthenticationManager khi login
     *   2. JwtAuthenticationFilter khi validate token
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy user với email: " + email
                ));

        return buildUserDetails(user);
    }

    /**
     * Load user theo ID - dùng cho một số trường hợp đặc biệt.
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy user với id: " + id
                ));

        return buildUserDetails(user);
    }

    /**
     * Chuyển User entity thành UserDetails mà Spring Security hiểu được.
     *
     * Spring Security dùng UserDetails để:
     *   - Kiểm tra password (khi login)
     *   - Kiểm tra account status (isEnabled, isAccountNonLocked, ...)
     *   - Lấy authorities (roles) để phân quyền
     */
    private UserDetails buildUserDetails(User user) {
        // Chuyển Role enum thành GrantedAuthority
        // VD: ROLE_ADMIN → SimpleGrantedAuthority("ROLE_ADMIN")
        Collection<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(user.getRole().name())
        );

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())          // username = email
                .password(user.getPassword())           // BCrypt hash
                .authorities(authorities)               // roles
                .accountExpired(false)
                .accountLocked(!user.getIsActive())     // isActive=false → account bị khóa
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
