import PropTypes from "prop-types";
import Form from "../../forms/Form";
import { hiddenFields } from "../utils/fieldTypes";
import { useContext } from "react";
import CustomizationContext from "../../contexts/CustomizationContext";
import PropKeyEditorObjectFieldTemplate from "../formComponents/PropKeyEditorObjectFieldTemplate";

const PropertyKeyEditorForm = ({
  uiSchema = {},
  schema = {},
  formData = {},
  onChange = null,
  isRoot,
}) => {
  const customizationContext = useContext(CustomizationContext);

  const updatedFormData = { ...formData };

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

  const {
    optionsSchema = {},
    optionsUiSchema = {},
    settingsOrder = null,
  } = objs[type];

  const schemaProps = optionsSchema.properties || {};
  const uiSchemaProps = optionsUiSchema.properties || {};

  let combinedProperties = { ...schemaProps, ...uiSchemaProps };

  if (settingsOrder) {
    combinedProperties = settingsOrder.reduce((acc, key) => {
      if (key === "*") {
        return { ...acc, ...schemaProps, ...uiSchemaProps };
      }
      if (schemaProps[key] !== undefined || uiSchemaProps[key] !== undefined) {
        delete acc[key]; // Guarantee order for items after * (e.g. ["a", "*", "c"])
        acc[key] = schemaProps[key] ?? uiSchemaProps[key];
      }
      return acc;
    }, {});
  }

  const combinedSchema = { ...optionsSchema, properties: combinedProperties };

  return (
    <Form
      schema={isRoot ? optionsSchema : combinedSchema}
      formData={updatedFormData}
      onChange={onChange}
      liveValidate
      hideAnchors
      ObjectFieldTemplate={PropKeyEditorObjectFieldTemplate}
    />
  );
};

PropertyKeyEditorForm.propTypes = {
  schema: PropTypes.object,
  uiSchema: PropTypes.object,
  formData: PropTypes.object,
  onChange: PropTypes.func,
  isRoot: PropTypes.bool,
};

export default PropertyKeyEditorForm;
