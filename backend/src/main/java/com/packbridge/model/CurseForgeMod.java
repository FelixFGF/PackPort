package com.packbridge.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurseForgeMod {
    private int projectId;
    private int fileId;
    private boolean required;
    private String name;
}
