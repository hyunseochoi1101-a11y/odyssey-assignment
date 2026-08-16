import {
  getGetMenuQueryKey,
  useGetMenu,
  usePatchMenuItemsId,
  usePatchMenuItemsIdAvailability,
  usePatchMenuItemsIdPrepTime,
  usePostMenuItems,
} from 'api-client'
import { Button } from 'shared/button'
import { StatusBadge } from 'shared/status-badge'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'

type MenuForm = {
  categoryId: number | null
  name: string
  description: string
  price: string
  prepTimeMinutes: string
  isAvailable: boolean
}

const emptyForm: MenuForm = {
  categoryId: null,
  name: '',
  description: '',
  price: '',
  prepTimeMinutes: '10',
  isAvailable: true,
}

export function MenuScreen() {
  const queryClient = useQueryClient()
  const menuQuery = useGetMenu()

  const [showCreateForm, setShowCreateForm] =
    useState(false)

  const [editingItemId, setEditingItemId] =
    useState<number | null>(null)

  const [form, setForm] =
    useState<MenuForm>(emptyForm)

  const [prepTimeDrafts, setPrepTimeDrafts] =
    useState<Record<number, string>>({})

  const categories =
    menuQuery.data?.data.categories ?? []

  async function refreshMenu() {
    await queryClient.invalidateQueries({
      queryKey: getGetMenuQueryKey(),
    })
  }

  const createMutation = usePostMenuItems({
    mutation: {
      onSuccess: async () => {
        await refreshMenu()

        setForm(emptyForm)
        setShowCreateForm(false)
      },
    },
  })

  const editMutation = usePatchMenuItemsId({
    mutation: {
      onSuccess: async () => {
        await refreshMenu()

        setEditingItemId(null)
        setForm(emptyForm)
      },
    },
  })

  const availabilityMutation =
    usePatchMenuItemsIdAvailability({
      mutation: {
        onSuccess: refreshMenu,
      },
    })

  const prepTimeMutation =
    usePatchMenuItemsIdPrepTime({
      mutation: {
        onSuccess: refreshMenu,
      },
    })

  function resetForm() {
    setForm(emptyForm)
    setEditingItemId(null)
    setShowCreateForm(false)
  }

  function startCreate() {
    setEditingItemId(null)

    setForm({
      ...emptyForm,
      categoryId:
        categories.length > 0
          ? categories[0].id
          : null,
    })

    setShowCreateForm(true)
  }

  function startEdit(
    item: {
      id: number
      categoryId: number
      name: string
      description: string | null
      priceCents: number
      prepTimeMinutes: number
      isAvailable: boolean
    }
  ) {
    setShowCreateForm(false)
    setEditingItemId(item.id)

    setForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? '',
      price: (item.priceCents / 100).toFixed(2),
      prepTimeMinutes:
        String(item.prepTimeMinutes),
      isAvailable: item.isAvailable,
    })
  }

  function submitForm() {
    if (form.categoryId === null) {
      return
    }

    const price = Number(form.price)
    const prepTime = Number(
      form.prepTimeMinutes
    )

    if (!form.name.trim()) {
      return
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return
    }

    if (
      !Number.isInteger(prepTime) ||
      prepTime < 1 ||
      prepTime > 240
    ) {
      return
    }

    const data = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      description:
        form.description.trim() || null,
      priceCents: Math.round(price * 100),
      prepTimeMinutes: prepTime,
      isAvailable: form.isAvailable,
    }

    if (editingItemId !== null) {
      editMutation.mutate({
        id: String(editingItemId),
        data,
      })

      return
    }

    createMutation.mutate({
      data,
    })
  }

  function toggleAvailability(
    itemId: number,
    currentAvailability: boolean
  ) {
    availabilityMutation.mutate({
      id: String(itemId),
      data: {
        isAvailable: !currentAvailability,
      },
    })
  }

  function savePrepTime(
    itemId: number,
    currentPrepTime: number
  ) {
    const rawValue =
      prepTimeDrafts[itemId] ??
      String(currentPrepTime)

    const prepTimeMinutes =
      Number(rawValue)

    if (
      !Number.isInteger(prepTimeMinutes) ||
      prepTimeMinutes < 1 ||
      prepTimeMinutes > 240
    ) {
      return
    }

    prepTimeMutation.mutate({
      id: String(itemId),
      data: {
        prepTimeMinutes,
      },
    })
  }

  if (menuQuery.isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading menu...</Text>
      </View>
    )
  }

  if (menuQuery.isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load menu.</Text>
      </View>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.title}>
            Menu
          </Text>

          <Text style={styles.subtitle}>
            Manage menu items, prep times,
            prices, and availability.
          </Text>
        </View>

        <Button
  label="+ Add Menu Item"
  onPress={startCreate}
/>
      </View>

      {showCreateForm ||
      editingItemId !== null ? (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {editingItemId !== null
                ? 'Edit Menu Item'
                : 'Create Menu Item'}
            </Text>

            <Pressable onPress={resetForm}>
              <Text>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>
            Category
          </Text>

          <View style={styles.categoryOptions}>
            {categories.map((category) => {
              const active =
                form.categoryId ===
                category.id

              return (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    setForm((current) => ({
                      ...current,
                      categoryId:
                        category.id,
                    }))
                  }
                  style={[
                    styles.categoryButton,
                    active &&
                      styles.categoryButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      active &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.fieldLabel}>
            Name
          </Text>

          <TextInput
            value={form.name}
            onChangeText={(value) =>
              setForm((current) => ({
                ...current,
                name: value,
              }))
            }
            placeholder="Menu item name"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>
            Description
          </Text>

          <TextInput
            value={form.description}
            onChangeText={(value) =>
              setForm((current) => ({
                ...current,
                description: value,
              }))
            }
            placeholder="Description"
            multiline
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Text style={styles.fieldLabel}>
                Price
              </Text>

              <TextInput
                value={form.price}
                onChangeText={(value) =>
                  setForm((current) => ({
                    ...current,
                    price: value,
                  }))
                }
                placeholder="12.99"
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.formColumn}>
              <Text style={styles.fieldLabel}>
                Prep Time
              </Text>

              <TextInput
                value={
                  form.prepTimeMinutes
                }
                onChangeText={(value) =>
                  setForm((current) => ({
                    ...current,
                    prepTimeMinutes:
                      value,
                  }))
                }
                placeholder="10"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>
                Available
              </Text>

              <Text style={styles.helpText}>
                Customers can order this
                item.
              </Text>
            </View>

            <Switch
              value={form.isAvailable}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  isAvailable: value,
                }))
              }
            />
          </View>

          <Pressable
            onPress={submitForm}
            disabled={
              createMutation.isPending ||
              editMutation.isPending
            }
            style={[
              styles.submitButton,
              (createMutation.isPending ||
                editMutation.isPending) &&
                styles.buttonDisabled,
            ]}
          >
            <Text
              style={
                styles.submitButtonText
              }
            >
              {createMutation.isPending ||
              editMutation.isPending
                ? 'Saving...'
                : editingItemId !== null
                  ? 'Save Changes'
                  : 'Create Item'}
            </Text>
          </Pressable>

          {createMutation.isError ||
          editMutation.isError ? (
            <Text style={styles.errorText}>
              Failed to save menu item.
            </Text>
          ) : null}
        </View>
      ) : null}

      {categories.map((category) => (
        <View
          key={category.id}
          style={styles.categorySection}
        >
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>
              {category.name}
            </Text>

            <Text style={styles.itemCount}>
              {category.items.length}{' '}
              {category.items.length === 1
                ? 'item'
                : 'items'}
            </Text>
          </View>

          <View style={styles.grid}>
            {category.items.map((item) => {
              const prepTimeValue =
                prepTimeDrafts[item.id] ??
                String(
                  item.prepTimeMinutes
                )

              return (
                <View
                  key={item.id}
                  style={styles.card}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardInfo}>
                      <Text
                        style={styles.itemName}
                      >
                        {item.name}
                      </Text>

                      <Text style={styles.price}>
                        $
                        {(
                          item.priceCents /
                          100
                        ).toFixed(2)}
                      </Text>
                    </View>

                    <StatusBadge
  status={
    item.isAvailable
      ? 'available'
      : 'unavailable'
  }
/>
                  </View>

                  <Text
                    style={styles.description}
                  >
                    {item.description ??
                      'No description available.'}
                  </Text>

                  <Pressable
                    onPress={() =>
                      startEdit(item)
                    }
                    style={styles.editButton}
                  >
                    <Text
                      style={
                        styles.editButtonText
                      }
                    >
                      Edit Item
                    </Text>
                  </Pressable>

                  <View style={styles.divider} />

                  <Text style={styles.fieldLabel}>
                    Prep Time
                  </Text>

                  <View
                    style={styles.prepTimeRow}
                  >
                    <TextInput
                      value={prepTimeValue}
                      onChangeText={(value) =>
                        setPrepTimeDrafts(
                          (current) => ({
                            ...current,
                            [item.id]:
                              value,
                          })
                        )
                      }
                      keyboardType="numeric"
                      style={
                        styles.prepTimeInput
                      }
                    />

                    <Text
                      style={styles.minutesText}
                    >
                      minutes
                    </Text>

                    <Pressable
                      disabled={
                        prepTimeMutation.isPending
                      }
                      onPress={() =>
                        savePrepTime(
                          item.id,
                          item.prepTimeMinutes
                        )
                      }
                      style={[
                        styles.savePrepButton,
                        prepTimeMutation.isPending &&
                          styles.buttonDisabled,
                      ]}
                    >
                      <Text
                        style={
                          styles.savePrepButtonText
                        }
                      >
                        Save
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.fieldLabel}>
                    Availability
                  </Text>

                  <Pressable
                    disabled={
                      availabilityMutation.isPending
                    }
                    onPress={() =>
                      toggleAvailability(
                        item.id,
                        item.isAvailable
                      )
                    }
                    style={[
                      styles.toggleButton,
                      item.isAvailable
                        ? styles.disableButton
                        : styles.enableButton,
                      availabilityMutation.isPending &&
                        styles.buttonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        item.isAvailable
                          ? styles.disableButtonText
                          : styles.enableButtonText,
                      ]}
                    >
                      {item.isAvailable
                        ? 'Mark unavailable'
                        : 'Mark available'}
                    </Text>
                  </Pressable>
                </View>
              )
            })}
          </View>
        </View>
      ))}

      {categories.length === 0 ? (
        <View style={styles.empty}>
          <Text>
            No menu categories yet.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    flexGrow: 1,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pageHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    opacity: 0.6,
  },

  createButton: {
    backgroundColor: '#111827',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  formCard: {
    maxWidth: 760,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
  },

  formHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    marginBottom: 24,
  },

  formTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.55,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  categoryButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  categoryButtonText: {
    fontSize: 13,
  },

  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  formRow: {
    flexDirection: 'row',
    gap: 14,
  },

  formColumn: {
    flex: 1,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  helpText: {
    marginTop: 3,
    fontSize: 12,
    opacity: 0.55,
  },

  submitButton: {
    backgroundColor: '#111827',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  categorySection: {
    marginBottom: 32,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 14,
  },

  categoryTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  itemCount: {
    fontSize: 13,
    opacity: 0.5,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  card: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 18,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  cardInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 17,
    fontWeight: '700',
  },

  price: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: '600',
  },

  description: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.6,
    minHeight: 38,
  },

  editButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },

  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F1F3',
    marginVertical: 16,
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
  },

  availableBadge: {
    backgroundColor: '#DCFCE7',
  },

  unavailableBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  availableText: {
    color: '#166534',
  },

  unavailableText: {
    color: '#991B1B',
  },

  prepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  prepTimeInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },

  minutesText: {
    fontSize: 13,
    opacity: 0.6,
    flex: 1,
  },

  savePrepButton: {
    backgroundColor: '#111827',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  savePrepButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  toggleButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  disableButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  enableButton: {
    backgroundColor: '#111827',
  },

  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  disableButtonText: {
    color: '#111827',
  },

  enableButtonText: {
    color: '#FFFFFF',
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  errorText: {
    color: '#B91C1C',
    marginTop: 12,
  },

  empty: {
    padding: 32,
    alignItems: 'center',
  },
})