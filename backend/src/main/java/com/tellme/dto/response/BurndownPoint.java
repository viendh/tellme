package com.tellme.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BurndownPoint {
    private String date;     // yyyy-MM-dd
    private int remaining;   // issues not yet DONE on this day
    private int ideal;       // ideal remaining (linear)
    private int completed;   // cumulative issues DONE by this day
}
