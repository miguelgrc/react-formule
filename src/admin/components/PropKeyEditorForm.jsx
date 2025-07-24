import PropTypes from "prop-types";
import Form from "../../forms/Form";
import { hiddenFields } from "../utils/fieldTypes";
import widgets from "../formComponents/widgets";
import { useContext } from "react";
import CustomizationContext from "../../contexts/CustomizationContext";
import PropKeyEditorObjectFieldTemplate from "../formComponents/PropKeyEditorObjectFieldTemplate";

const PropertyKeyEditorForm = ({
  uiSchema = {},
  schema = {},
  formData = {},
  onChange = null,
  optionsSchemaObject,
  optionsUiSchemaObject,
}) => {
  const customizationContext = useContext(CustomizationContext);

  const updatedFormData = { ...formData };

  console.log(updatedFormData);

  let type;

  const cleanupSelect = () =>
    schema.type === "array"
      ? delete updatedFormData.enum
      : delete updatedFormData.items;

  // in case we can not define the type of the element from the uiSchema,
  // extract the type from the schema
  if (
    !uiSchema ||
    (!uiSchema["ui:widget"] && !uiSchema["ui:field"] && !uiSchema["ui:object"])
  ) {
    type = schema.type === "string" ? "text" : schema.type;
  } else {
    if (uiSchema["ui:widget"]) {
      type = uiSchema["ui:widget"];
      if (type === "select") {
        cleanupSelect();
      }
    }
    if (uiSchema["ui:field"]) {
      type = uiSchema["ui:field"];
    }
    if (uiSchema["ui:object"]) {
      type = uiSchema["ui:object"];
    }
  }

  // if there is no type then there is nothing to return
  if (!type) return;
  const objs = {
    ...customizationContext.allFieldTypes.collections.fields,
    ...customizationContext.allFieldTypes.simple.fields,
    ...customizationContext.allFieldTypes.advanced.fields,
    ...hiddenFields,
  };

  // console.log(objs[type]?.[`${optionsSchemaObject}`]);
  // console.log(objs[type]?.[`${optionsUiSchemaObject}`]);

  const mySchema = objs[type].optionsSchema || {};
  const myUiSchema = objs[type].optionsUiSchema || {};

  // console.log("mySchema", mySchema);
  // console.log("myUiSchema", myUiSchema);

  const combinedSchema = { ...mySchema };
  combinedSchema.properties = {
    ...mySchema.properties,
    ...myUiSchema.properties,
  };

  // console.log("combinedSchema", combinedSchema);

  return (
    <Form
      // schema={objs[type]?.[`${optionsSchemaObject}`] || {}}
      // uiSchema={objs[type]?.[`${optionsUiSchemaObject}`] || {}}
      schema={combinedSchema}
      // uiSchema={objs[type] || {}}
      widgets={widgets}
      formData={updatedFormData}
      onChange={onChange}
      liveValidate
      hideAnchors
      // ObjectFieldTemplate={PropKeyEditorObjectFieldTemplate}
    />
  );
};

PropertyKeyEditorForm.propTypes = {
  schema: PropTypes.object,
  uiSchema: PropTypes.object,
  formData: PropTypes.object,
  onChange: PropTypes.func,
  optionsSchemaObject: PropTypes.object,
  optionsUiSchemaObject: PropTypes.object,
};

export default PropertyKeyEditorForm;
