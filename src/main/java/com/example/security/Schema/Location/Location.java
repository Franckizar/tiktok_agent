// package com.example.security.Schema.Location;

// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.List;

// import com.example.security.Schema.Tournament.Tournament;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.FetchType;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.OneToMany;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.Table;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Entity
// @Table(name = "locations")
// @Data @Builder @NoArgsConstructor @AllArgsConstructor
// public class Location {


//     @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;


//     @Column(nullable = false)
//     private String name;


//     @Column(nullable = false)
//     private String address;


//     @Column(nullable = false)
//     private String city;


//     @Column(nullable = false)
//     private String country;


//     @Column(nullable = false)
//     private Integer capacity;


//     @Column(name = "contact_phone")
//     private String contactPhone;


//     @Column(name = "contact_email")
//     private String contactEmail;


//     @Column(name = "is_active")
//     private Boolean isActive = true;


//     @Column(name = "created_at", nullable = false, updatable = false)
//     private LocalDateTime createdAt;


//     @OneToMany(mappedBy = "location", fetch = FetchType.LAZY)
//     private List<Tournament> tournaments = new ArrayList<>();


//     @PrePersist
//     protected void onCreate() { createdAt = LocalDateTime.now(); }
// }
