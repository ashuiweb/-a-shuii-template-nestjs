type WhereType<T, B = { _id: string; attr?: Record<string, any> }> = Partial<B & T>
