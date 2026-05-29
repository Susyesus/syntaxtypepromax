package com.syntaxtype.demo.core.security;

import com.syntaxtype.demo.features.user.entity.User;
import com.syntaxtype.demo.features.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Return CustomUserDetails (wraps the User entity) so controllers using
        // @AuthenticationPrincipal CustomUserDetails resolve a non-null principal.
        // CustomUserDetails.getAuthorities() already supplies the ROLE_ prefix.
        return new CustomUserDetails(user);
    }
}