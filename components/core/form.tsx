import { FormikProvider, useFormik, type FormikValues } from "formik";
import React from "react";
import { View, type ViewProps } from "react-native";
import * as Yup from "yup";

interface FormProps<T extends FormikValues> extends Omit<ViewProps, 'children'> {
  initialValues: T;
  validationSchema: Yup.ObjectSchema<T>;
  onSubmit: (values: T) => void;
  children: (formik: ReturnType<typeof useFormik<T>>) => React.ReactNode;
}

const Form = <T extends FormikValues>({
  onSubmit,
  validationSchema,
  initialValues,
  children,
  style,
  ...viewProps
}: FormProps<T>) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnBlur: true,
    validateOnChange: true,
    enableReinitialize: true,
  });

  return (
    <FormikProvider value={formik}>
      <View style={style} {...viewProps}>
        {children(formik)}
      </View>
    </FormikProvider>
  );
};

Form.displayName = "Form";
export default Form;
