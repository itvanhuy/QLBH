import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class Gen {
    public static void main(String[] a) {
        System.out.println(new BCryptPasswordEncoder(10).encode("123456"));
    }
}
