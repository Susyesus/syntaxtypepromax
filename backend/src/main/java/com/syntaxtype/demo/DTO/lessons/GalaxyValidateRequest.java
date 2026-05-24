package com.syntaxtype.demo.DTO.lessons;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GalaxyValidateRequest {
    private Long questionId;
    private String answer;
}
