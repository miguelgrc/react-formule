import { useEffect, useState } from "react";
import PropertyKeyEditorForm from "./PropKeyEditorForm";

import { Radio, Space, Typography } from "antd";
import { SIZE_OPTIONS } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSchemaByPath,
  updateUiSchemaByPath,
} from "../../store/schemaWizard";

import { get } from "lodash-es";

const JUSTIFY_OPTIONS = ["start", "center", "end"];

const Customize = () => {
  const [justify, setJustify] = useState(() => "start");
  const [size, setSize] = useState("xlarge");

  const dispatch = useDispatch();
  const path = useSelector((state) => state.schemaWizard.field.path);
  const uiPath = useSelector((state) => state.schemaWizard.field.uiPath);

  const schema = useSelector(
    (state) => path && get(state.schemaWizard, ["current", "schema", ...path]),
  );
  const uiSchema = useSelector(
    (state) =>
      uiPath && get(state.schemaWizard, ["current", "uiSchema", ...uiPath]),
  );

  useEffect(() => {
    if (uiSchema && Object.hasOwn(uiSchema, "ui:options")) {
      setSize(uiSchema["ui:options"].size);
      setJustify(uiSchema["ui:options"].justify);
    }
  }, [uiSchema]);

  const handleSchemasChange = (data) => {
    const uiProps = {};
    const restProps = {};

    Object.entries(data.formData).forEach(([key, value]) => {
      if (key.startsWith("ui:")) {
        uiProps[key] = value;
      } else {
        restProps[key] = value;
      }
    });

    if (Object.keys(uiProps).length > 0) {
      dispatch(updateUiSchemaByPath({ path: uiPath, value: uiProps }));
    }
    dispatch(updateSchemaByPath({ path: path, value: restProps }));
  };

  const sizeChange = (newSize) => {
    let { "ui:options": uiOptions = {}, ...rest } = uiSchema;

    dispatch(
      updateUiSchemaByPath({
        path: uiPath,
        value: {
          ...rest,
          "ui:options": { ...uiOptions, size: newSize },
        },
      }),
    );
  };

  const alignChange = (newAlign) => {
    let { "ui:options": uiOptions = {}, ...rest } = uiSchema;

    dispatch(
      updateUiSchemaByPath({
        path: uiPath,
        value: {
          ...rest,
          "ui:options": { ...uiOptions, justify: newAlign },
        },
      }),
    );
  };

  const combinedSchema = { ...schema, ...uiSchema };

  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
      {!path.length && (
        <Space
          direction="vertical"
          style={{ padding: "0 12px 12px 12px", width: "100%" }}
        >
          <Typography.Text strong>Size Options</Typography.Text>
          <Radio.Group
            size="small"
            block
            onChange={(e) => sizeChange(e.target.value)}
            value={size}
            style={{ paddingBottom: "15px" }}
          >
            {Object.keys(SIZE_OPTIONS).map((size) => (
              <Radio.Button key={size} value={size}>
                {size}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Typography.Text strong>Align Options</Typography.Text>
          <Radio.Group
            size="small"
            block
            onChange={(e) => alignChange(e.target.value)}
            value={justify}
          >
            {JUSTIFY_OPTIONS.map((justify) => (
              <Radio.Button key={justify} value={justify}>
                {justify}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Space>
      )}
      <PropertyKeyEditorForm
        schema={schema && schema}
        uiSchema={uiSchema && uiSchema}
        formData={combinedSchema}
        onChange={handleSchemasChange}
        isRoot={!path.length}
      />
    </div>
  );
};

export default Customize;
