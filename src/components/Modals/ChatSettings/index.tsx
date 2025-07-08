import { fetchTipMenu, updateTipMenu } from "@/api/tipMenu";
import { useClickOutside, useToggleModal } from "@/hooks";
import { FC, useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

interface Props {
  roomId: string;
}

interface TipMenuItem {
  description: string;
  value: number;
}

export const ChatSettings: FC<Props> = ({ roomId }) => {
  const toggleModal = useToggleModal();
  const ref = useClickOutside(() => toggleModal("chatSettings"));
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      tipMenu: [] as TipMenuItem[],
    },
    validationSchema: Yup.object({
      tipMenu: Yup.array().of(
        Yup.object({
          description: Yup.string().required("Название обязательно"),
          value: Yup.number()
            .typeError("Должно быть числом")
            .positive("Должно быть больше нуля")
            .required("Цена обязательна"),
        })
      ),
    }),
    onSubmit: (values) => {
      updateTipMenu(roomId, values.tipMenu).then(() => {
        toast.success("TIP-меню обновлено");
      })
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    fetchTipMenu(roomId).then((res) => {
      if (res.data && Array.isArray(res.data)) {
        formik.setValues({ tipMenu: res.data });
      }
      setLoading(false);
    });
  }, [roomId]);

  const handleAddItem = () => {
    formik.setFieldValue("tipMenu", [
      ...formik.values.tipMenu,
      { id: formik.values.tipMenu.length + 1, value: 0, description: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...formik.values.tipMenu];
    updated.splice(index, 1);
    formik.setFieldValue("tipMenu", updated);
  };

  if (loading) return null;

  return (
    <div className="absolute z-10 bg-black/60 w-full h-full flex items-center justify-center px-4">
      <div
        ref={ref}
        className="relative bg-zinc-900 p-6 rounded-xl shadow-xl w-[80%] max-w-xl border border-zinc-700"
      >
        <IoCloseOutline
          className="absolute top-5 right-5 text-lg cursor-pointer"
          onClick={() => toggleModal("chatSettings")}
        />

        <h3 className="text-2xl font-semibold text-white mb-4 text-left border-b border-white/20 pb-4">
          Настройки чата
        </h3>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto">
          {formik.values.tipMenu.map((item, index) => (
            <div
              key={index}
              className="flex gap-2 items-start bg-zinc-800 p-1 px-2 rounded mb-2"
            >
              <div className="w-20">
                <label className="block text-sm text-white mb-1">Цена</label>
                <input
                  type="number"
                  name={`tipMenu.${index}.value`}
                  value={item.value}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 rounded bg-zinc-900 text-white border border-zinc-600"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-white mb-1">
                  Описание
                </label>
                <input
                  name={`tipMenu.${index}.description`}
                  value={item.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 rounded bg-zinc-900 text-white border border-zinc-600"
                />
              </div>

              <button
                type="button"
                className="text-red-400 mt-7 text-sm hover:underline"
                onClick={() => handleRemoveItem(index)}
              >
                Удалить
              </button>
            </div>
          ))}
          </div>
          <div className="text-right">
            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              onClick={handleAddItem}
            >
              + Добавить пункт
            </button>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
