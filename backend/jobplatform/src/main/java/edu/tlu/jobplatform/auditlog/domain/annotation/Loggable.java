package edu.tlu.jobplatform.auditlog.domain.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Loggable {

    String action();

    String resourceType() default "";

    boolean logResult() default false;
}